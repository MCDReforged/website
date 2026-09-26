import { GithubApiError, GithubGitTree, GithubRepo, encodeRepoPath, githubRequest, sleep } from '@/server/github/client'
import {
  asString,
  AuthorLinkContext,
  getLinksHomepage,
  getPluginId,
  normalizeAuthors,
  RawPluginMetadata,
} from './metadata'
import { PluginCandidate, RepoDetail, RepoListItem } from './types'

const REPO_LIST_MAX_PAGES = 3
const REPO_LIST_PER_PAGE = 100
const BRANCH_MAX_PAGES = 2
const MAX_PLUGIN_CANDIDATES = 20
const MAX_MD_FILES = 300
/**
 * Markdown depth limit, measured from the repository root. Generous on purpose: the plugin's own
 * directory counts towards it, and a nested plugin must not lose the files sitting next to it.
 */
const MAX_MD_SEGMENTS = 6

const IGNORED_SEGMENTS = new Set([
  'node_modules', '.git', '.github', '.venv', 'venv', 'env', 'site-packages', '__pycache__',
  'dist', 'build', '.mcdreforged', '.idea', '.vscode', '.tox', '.next', 'target', 'third_party',
])

/** GitHub owner / repository names: letters, digits, `-`, `_` and `.` only. */
const REPO_SEGMENT_REGEX = /^[A-Za-z0-9][A-Za-z0-9_.-]*$/

export function splitRepo(fullName: string): [string, string] | null {
  const parts = fullName.trim().split('/')
  if (parts.length !== 2 || !parts.every(part => REPO_SEGMENT_REGEX.test(part))) {
    return null
  }
  return [parts[0], parts[1]]
}

function segments(path: string): string[] {
  return path.split('/').filter(s => s.length > 0)
}

function isIgnoredPath(path: string): boolean {
  return segments(path).some(segment => IGNORED_SEGMENTS.has(segment.toLowerCase()))
}

function dirOf(path: string): string {
  const index = path.lastIndexOf('/')
  return index === -1 ? '.' : path.slice(0, index)
}

function depthOf(path: string): number {
  return segments(path).length
}

export async function listUserRepos(token: string): Promise<{ repos: RepoListItem[], truncated: boolean }> {
  const repos: RepoListItem[] = []
  let truncated = false

  for (let page = 1; page <= REPO_LIST_MAX_PAGES; page++) {
    const pageRepos = await githubRequest<GithubRepo[]>('/user/repos', {
      token,
      query: {
        // all three: plenty of plugins live in an organization repository the user can push to
        // without being listed as an explicit collaborator on it
        affiliation: 'owner,collaborator,organization_member',
        sort: 'pushed',
        direction: 'desc',
        per_page: REPO_LIST_PER_PAGE,
        page,
      },
    })
    for (const repo of pageRepos) {
      repos.push({
        fullName: repo.full_name,
        name: repo.name,
        owner: repo.owner.login,
        private: repo.private,
        fork: repo.fork,
        defaultBranch: repo.default_branch,
        pushedAt: repo.pushed_at,
      })
    }
    if (pageRepos.length < REPO_LIST_PER_PAGE) {
      return { repos, truncated }
    }
    if (page === REPO_LIST_MAX_PAGES) {
      truncated = true
    }
  }
  return { repos, truncated }
}

export async function getRepoInfo(token: string, repo: string): Promise<GithubRepo> {
  return githubRequest<GithubRepo>(`/repos/${repo}`, { token })
}

export async function fetchTree(token: string, repo: string, branch: string): Promise<GithubGitTree> {
  return githubRequest<GithubGitTree>(`/repos/${repo}/git/trees/${encodeURIComponent(branch)}`, {
    token,
    query: { recursive: 1 },
  })
}

export async function readRepoFile(token: string, repo: string, branch: string, path: string): Promise<string | null> {
  const file = await githubRequest<{ content?: string, encoding?: string }>(
    `/repos/${repo}/contents/${encodeRepoPath(path)}`,
    { token, query: { ref: branch } },
  )
  if (file.encoding !== 'base64' || typeof file.content !== 'string') {
    return null
  }
  return Buffer.from(file.content, 'base64').toString('utf8')
}

export async function readPluginMetadata(
  token: string,
  repo: string,
  branch: string,
  path: string,
): Promise<RawPluginMetadata | null> {
  const content = await readRepoFile(token, repo, branch, path)
  if (content === null) {
    return null
  }
  try {
    const parsed = JSON.parse(content) as unknown
    return parsed !== null && typeof parsed === 'object' ? parsed as RawPluginMetadata : null
  } catch {
    return null
  }
}

async function listBranches(token: string, repo: string): Promise<string[]> {
  const branches: string[] = []
  for (let page = 1; page <= BRANCH_MAX_PAGES; page++) {
    const pageBranches = await githubRequest<{ name: string }[]>(`/repos/${repo}/branches`, {
      token,
      query: { per_page: 100, page },
    })
    branches.push(...pageBranches.map(b => b.name))
    if (pageBranches.length < 100) {
      break
    }
  }
  return branches
}

export function findIntroductionCandidates(tree: GithubGitTree): string[] {
  return tree.tree
    .filter(entry => entry.type === 'blob')
    .map(entry => entry.path)
    .filter(path => path.toLowerCase().endsWith('.md'))
    .filter(path => depthOf(path) <= MAX_MD_SEGMENTS)
    .filter(path => !isIgnoredPath(path))
    .sort((a, b) => depthOf(a) - depthOf(b) || a.localeCompare(b))
    .slice(0, MAX_MD_FILES)
}

export function findPluginCandidates(tree: GithubGitTree): string[] {
  return tree.tree
    .filter(entry => entry.type === 'blob')
    .map(entry => entry.path)
    .filter(path => path === 'mcdreforged.plugin.json' || path.endsWith('/mcdreforged.plugin.json'))
    .filter(path => !isIgnoredPath(path))
    .sort((a, b) => depthOf(a) - depthOf(b) || a.localeCompare(b))
}

function authorContext(ownerLogin: string | undefined, viewerLogin: string | undefined): AuthorLinkContext {
  return {
    preferredLogins: [ownerLogin, viewerLogin]
      .filter((login): login is string => typeof login === 'string' && login.length > 0),
  }
}

function toCandidate(
  relatedPath: string,
  metadata: RawPluginMetadata | null,
  context: AuthorLinkContext,
  error?: string,
): PluginCandidate {
  if (metadata === null) {
    return { relatedPath, metadata: {}, validId: false, error: error ?? 'unreadable' }
  }
  const id = getPluginId(metadata)
  const homepage = getLinksHomepage(metadata)
  return {
    relatedPath,
    metadata: {
      id: id ?? undefined,
      name: asString(metadata.name),
      version: asString(metadata.version),
      description: (metadata.description ?? undefined) as string | Record<string, string> | undefined,
      authors: normalizeAuthors(metadata, context),
      links: metadata.links ?? (homepage !== undefined ? { homepage } : null),
    },
    validId: id !== null,
    error: id === null ? 'invalid_id' : undefined,
  }
}

/** Reads `relatedPath/mcdreforged.plugin.json` and turns it into a candidate. */
export async function resolvePluginCandidate(
  token: string,
  repo: string,
  branch: string | undefined,
  relatedPath: string,
  viewerLogin?: string,
): Promise<PluginCandidate | null> {
  // the owner login is already in `repo`, so the repo lookup is only needed for the default branch
  const owner = splitRepo(repo)?.[0] ?? repo
  const selectedBranch = branch && branch.length > 0
    ? branch
    : (await getRepoInfo(token, repo)).default_branch
  const pluginJsonPath = relatedPath === '.' ? 'mcdreforged.plugin.json' : `${relatedPath}/mcdreforged.plugin.json`
  const context = authorContext(owner, viewerLogin)

  try {
    const metadata = await readPluginMetadata(token, repo, selectedBranch, pluginJsonPath)
    return toCandidate(relatedPath, metadata, context)
  } catch (error) {
    if (error instanceof GithubApiError && error.status === 404) {
      return null
    }
    throw error
  }
}

export async function getRepoDetail(
  token: string,
  repo: string,
  branch?: string,
  viewerLogin?: string,
): Promise<RepoDetail> {
  const repoInfo = await getRepoInfo(token, repo)
  const defaultBranch = repoInfo.default_branch
  const selectedBranch = branch && branch.length > 0 ? branch : defaultBranch
  const context = authorContext(repoInfo.owner?.login, viewerLogin)

  const [branches, tree] = await Promise.all([
    listBranches(token, repo),
    fetchTree(token, repo, selectedBranch),
  ])
  if (!branches.includes(defaultBranch)) {
    branches.unshift(defaultBranch)
  }
  if (!branches.includes(selectedBranch)) {
    branches.unshift(selectedBranch)
  }

  const allCandidatePaths = findPluginCandidates(tree)
  const candidates = await Promise.all(allCandidatePaths.slice(0, MAX_PLUGIN_CANDIDATES).map(async path => {
    const relatedPath = dirOf(path)
    try {
      const metadata = await readPluginMetadata(token, repo, selectedBranch, path)
      return toCandidate(relatedPath, metadata, context)
    } catch (error) {
      if (error instanceof GithubApiError) {
        return toCandidate(relatedPath, null, context, `github_${error.status}`)
      }
      throw error
    }
  }))

  return {
    repo,
    defaultBranch,
    branch: selectedBranch,
    branches,
    candidates,
    candidatesTruncated: allCandidatePaths.length > MAX_PLUGIN_CANDIDATES,
    mdFiles: findIntroductionCandidates(tree),
    treeTruncated: tree.truncated,
  }
}

// ---- fork helpers ---- //

export async function tryGetRepo(token: string, fullName: string): Promise<GithubRepo | null> {
  try {
    return await getRepoInfo(token, fullName)
  } catch (error) {
    if (error instanceof GithubApiError && error.status === 404) {
      return null
    }
    throw error
  }
}

export async function ensureFork(
  token: string,
  upstream: string,
  forkFullName: string,
  timeoutMs: number = 15000,
): Promise<void> {
  const existing = await tryGetRepo(token, forkFullName)
  if (existing !== null) {
    if (!existing.fork || existing.parent?.full_name?.toLowerCase() !== upstream.toLowerCase()) {
      throw new Error(
        `A repository named ${forkFullName} already exists but is not a fork of ${upstream}. ` +
        'Please rename or delete it, then try again.',
      )
    }
    return
  }

  await githubRequest(`/repos/${upstream}/forks`, { token, method: 'POST', body: {} })

  const deadline = Date.now() + timeoutMs
  for (;;) {
    if (await tryGetRepo(token, forkFullName) !== null) {
      return
    }
    if (Date.now() > deadline) {
      throw new Error(`Timed out waiting for the fork ${forkFullName} to be created, please retry in a moment.`)
    }
    await sleep(500)
  }
}
