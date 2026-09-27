import { GithubApiError, GithubGitTree, GithubRepo, githubRequest } from '@/submit/github-api'
import { readRawFile } from '@/submit/github-raw'
import {
  asString,
  AuthorLinkContext,
  getLinksHomepage,
  getPluginId,
  normalizeAuthors,
} from './metadata'
import { PluginCandidate, RepoDetail } from './types'

const BRANCH_MAX_PAGES = 2
const MAX_PLUGIN_CANDIDATES = 20
const MAX_MD_FILES = 300
const MAX_MD_SEGMENTS = 6

const IGNORED_SEGMENTS = new Set([
  'node_modules', '.git', '.github', '.venv', 'venv', 'env', 'site-packages', '__pycache__',
  'dist', 'build', '.mcdreforged', '.idea', '.vscode', '.tox', '.next', 'target', 'third_party',
])

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

export async function getRepoInfo(repo: string): Promise<GithubRepo> {
  return githubRequest<GithubRepo>(`/repos/${repo}`)
}

export async function fetchTree(repo: string, branch: string): Promise<GithubGitTree> {
  return githubRequest<GithubGitTree>(`/repos/${repo}/git/trees/${encodeURIComponent(branch)}`, {
    query: { recursive: 1 },
  })
}

export async function readRepoFile(repo: string, branch: string, path: string): Promise<string | null> {
  return readRawFile(repo, branch, path)
}

export async function readPluginMetadata(
  repo: string,
  branch: string,
  path: string,
): Promise<Record<string, unknown> | null> {
  const content = await readRepoFile(repo, branch, path)
  if (content === null) {
    return null
  }
  try {
    const parsed = JSON.parse(content) as unknown
    return parsed !== null && typeof parsed === 'object' ? parsed as Record<string, unknown> : null
  } catch {
    return null
  }
}

async function listBranches(repo: string): Promise<string[]> {
  const branches: string[] = []
  for (let page = 1; page <= BRANCH_MAX_PAGES; page++) {
    const pageBranches = await githubRequest<{ name: string }[]>(`/repos/${repo}/branches`, {
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
  metadata: Record<string, unknown> | null,
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

export async function resolvePluginCandidate(
  repo: string,
  branch: string | undefined,
  relatedPath: string,
  viewerLogin?: string,
): Promise<PluginCandidate | null> {
  const owner = splitRepo(repo)?.[0] ?? repo
  const selectedBranch = branch && branch.length > 0
    ? branch
    : (await getRepoInfo(repo)).default_branch
  const pluginJsonPath = relatedPath === '.' ? 'mcdreforged.plugin.json' : `${relatedPath}/mcdreforged.plugin.json`
  const context = authorContext(owner, viewerLogin)

  try {
    const metadata = await readPluginMetadata(repo, selectedBranch, pluginJsonPath)
    return toCandidate(relatedPath, metadata, context)
  } catch (error) {
    if (error instanceof GithubApiError && error.status === 404) {
      return null
    }
    throw error
  }
}

export async function getRepoDetail(
  repo: string,
  branch?: string,
  viewerLogin?: string,
): Promise<RepoDetail> {
  const repoInfo = await getRepoInfo(repo)
  const defaultBranch = repoInfo.default_branch
  const selectedBranch = branch && branch.length > 0 ? branch : defaultBranch
  const context = authorContext(repoInfo.owner?.login, viewerLogin)

  const [branches, tree] = await Promise.all([
    listBranches(repo),
    fetchTree(repo, selectedBranch),
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
      const metadata = await readPluginMetadata(repo, selectedBranch, path)
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
