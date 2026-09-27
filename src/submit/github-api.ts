
export class GithubApiError extends Error {
  readonly status: number
  readonly apiMessage: string
  readonly body: unknown
  readonly rateLimited: boolean

  constructor(status: number, apiMessage: string, body?: unknown, rateLimited = false) {
    super(`GitHub API error ${status}: ${apiMessage}`)
    this.name = 'GithubApiError'
    this.status = status
    this.apiMessage = apiMessage
    this.body = body
    this.rateLimited = rateLimited
  }
}

export interface GithubRequestOptions {
  query?: Record<string, string | number | boolean | undefined>
  accept?: string
}

const DEFAULT_API_BASE = 'https://api.github.com'

// one visit asks for the same tree twice, so responses are cached briefly
const CACHE_TTL_MS = 60_000

const REQUEST_TIMEOUT_MS = 30_000

const cache = new Map<string, { at: number, value: unknown }>()

let apiBase = DEFAULT_API_BASE

export function setGithubApiBase(base: string | undefined): void {
  apiBase = (base && base.trim().length > 0 ? base.trim() : DEFAULT_API_BASE).replace(/\/+$/, '')
}

export async function githubRequest<T>(path: string, options: GithubRequestOptions = {}): Promise<T> {
  const url = new URL(apiBase + path)
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  }

  const key = url.toString()
  const cached = cache.get(key)
  if (cached !== undefined && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.value as T
  }

  const response = await fetch(url, {
    headers: {
      accept: options.accept ?? 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  const text = await response.text()
  let data: unknown
  if (text.length > 0) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    const message = (data !== null && typeof data === 'object' && 'message' in data)
      ? String((data as { message: unknown }).message)
      : response.statusText
    const exhausted = response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0'
    throw new GithubApiError(response.status, message, data, exhausted)
  }

  cache.set(key, { at: Date.now(), value: data })
  return data as T
}

export interface GithubRepo {
  full_name: string
  name: string
  owner: { login: string }
  private: boolean
  fork: boolean
  default_branch: string
  pushed_at: string | null
  html_url: string
}

export interface GithubGitTreeEntry {
  path: string
  type: 'blob' | 'tree' | 'commit'
  sha: string
  size?: number
}

export interface GithubGitTree {
  sha: string
  tree: GithubGitTreeEntry[]
  truncated: boolean
}

export interface GithubCompare {
  status: 'identical' | 'ahead' | 'behind' | 'diverged'
  ahead_by: number
  behind_by: number
}

export interface GithubRelease {
  tag_name: string
  draft: boolean
  prerelease: boolean
  html_url?: string
  assets: { name: string }[]
}
