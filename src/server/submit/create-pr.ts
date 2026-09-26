import { GithubApiError, encodeRepoPath, githubRequest, sleep } from '@/server/github/client'
import { getCatalogueRepo } from '@/utils/environment-utils'
import { randomBytes } from 'node:crypto'
import { ensureFork, getRepoInfo, splitRepo } from './repo'
import { PluginInfoJson } from './types'

const BRANCH_ATTEMPTS = 5
const PR_ATTEMPTS = 2

export interface CreatePrResult {
  prUrl: string
  prNumber: number
  branch: string
  targetRepo: string
  /** true when the branch lives in a fork instead of the catalogue repository */
  forked: boolean
}

function randomSuffix(): string {
  return randomBytes(4).toString('hex')
}

function buildPrBody(pluginInfo: PluginInfoJson): string {
  const labels = pluginInfo.labels.length > 0 ? pluginInfo.labels.map(label => `\`${label}\``).join(', ') : '_none_'
  const relatedPath = pluginInfo.related_path === '.' ? '_repository root_' : `\`${pluginInfo.related_path}\``
  return [
    '### New plugin submission',
    '',
    '| | |',
    '| --- | --- |',
    `| Plugin ID | \`${pluginInfo.id}\` |`,
    `| Repository | ${pluginInfo.repository} |`,
    `| Branch | \`${pluginInfo.branch}\` |`,
    `| Related path | ${relatedPath} |`,
    `| Labels | ${labels} |`,
    '',
    'Submitted through the MCDReforged website plugin submission form.',
  ].join('\n')
}

async function syncFork(token: string, fork: string, base: string): Promise<void> {
  try {
    await githubRequest(`/repos/${fork}/merge-upstream`, { token, method: 'POST', body: { branch: base } })
  } catch {
    // best effort, the retry below reports the real error
  }
}

/**
 * Creates the submission branch on top of the *current* upstream default branch, commits
 * `plugins/<id>/plugin_info.json`, and opens the pull request.
 *
 * When the user can push to the catalogue directly (maintainers, or the test setup where the
 * logged-in user owns the catalogue) the branch is created in the catalogue itself, since GitHub
 * refuses to fork your own repository.
 */
export async function createSubmissionPr(
  token: string,
  login: string,
  pluginInfo: PluginInfoJson,
): Promise<CreatePrResult> {
  const upstream = getCatalogueRepo()
  const upstreamParts = splitRepo(upstream)
  if (upstreamParts === null) {
    throw new Error(`Invalid catalogue repository configured: ${upstream}`)
  }
  const upstreamName = upstreamParts[1]

  const upstreamInfo = await getRepoInfo(token, upstream)
  const base = upstreamInfo.default_branch
  const canPushDirectly = upstreamInfo.permissions?.push === true

  let targetRepo = upstream
  let headOwner: string | null = null
  let forked = false
  if (!canPushDirectly) {
    const forkFullName = `${login}/${upstreamName}`
    await ensureFork(token, upstream, forkFullName)
    targetRepo = forkFullName
    headOwner = login
    forked = true
  }

  // Always branch off upstream's latest commit, so an existing stale fork does not leak into the PR.
  const upstreamRef = await githubRequest<{ object: { sha: string } }>(
    `/repos/${upstream}/git/ref/heads/${encodeURIComponent(base)}`,
    { token },
  )
  const upstreamSha = upstreamRef.object.sha

  let branch: string | null = null
  for (let attempt = 0; attempt < BRANCH_ATTEMPTS && branch === null; attempt++) {
    const candidate = `submit/${pluginInfo.id}-${randomSuffix()}`
    try {
      await githubRequest(`/repos/${targetRepo}/git/refs`, {
        token,
        method: 'POST',
        body: { ref: `refs/heads/${candidate}`, sha: upstreamSha },
      })
      branch = candidate
    } catch (error) {
      if (!(error instanceof GithubApiError)) {
        throw error
      }
      if (error.isReferenceExists) {
        continue
      }
      if (error.isMissingObject && forked) {
        // the fork's object store has not caught up with upstream yet
        await syncFork(token, targetRepo, base)
        continue
      }
      throw error
    }
  }
  if (branch === null) {
    throw new Error('Could not create a submission branch in the catalogue, please try again later.')
  }

  const filePath = `plugins/${pluginInfo.id}/plugin_info.json`
  const content = Buffer.from(JSON.stringify(pluginInfo, null, 4) + '\n', 'utf8').toString('base64')
  await githubRequest(`/repos/${targetRepo}/contents/${encodeRepoPath(filePath)}`, {
    token,
    method: 'PUT',
    body: {
      message: `Add plugin ${pluginInfo.id}`,
      content,
      branch,
    },
  })

  let lastError: unknown = null
  for (let attempt = 0; attempt < PR_ATTEMPTS; attempt++) {
    try {
      const pr = await githubRequest<{ html_url: string, number: number }>(`/repos/${upstream}/pulls`, {
        token,
        method: 'POST',
        body: {
          title: `Add plugin ${pluginInfo.id}`,
          head: headOwner === null ? branch : `${headOwner}:${branch}`,
          base,
          body: buildPrBody(pluginInfo),
        },
      })
      return { prUrl: pr.html_url, prNumber: pr.number, branch, targetRepo, forked }
    } catch (error) {
      lastError = error
      // GitHub occasionally needs a moment before a freshly pushed head becomes PR-able
      if (error instanceof GithubApiError && error.status === 422 && attempt + 1 < PR_ATTEMPTS) {
        await sleep(1500)
        continue
      }
      throw error
    }
  }
  throw lastError
}
