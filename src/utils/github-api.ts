/**
 * GitHub REST access for the submission wizard.
 *
 * This runs in the browser and sends no credential. The rest of the website is key-less too — the
 * catalogue data and the guidelines come from `raw.githubusercontent.com`, which needs no token —
 * and keeping the wizard on the same footing means the site holds no GitHub secret at all, and the
 * anonymous quota is spent on the visitor's own address instead of on a shared server token.
 *
 * Anonymous requests are limited to 60 per hour per address, so responses are cached briefly and
 * the wizard tells the user what to do when the limit is reached.
 */

export class GithubApiError extends Error {
  readonly status: number
  readonly apiMessage: string
  readonly body: unknown
  /** the anonymous quota for this address is used up */
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

/** One visit asks for the same tree twice; a short cache keeps it inside the anonymous quota. */
const CACHE_TTL_MS = 60_000

/**
 * An API request that has not answered within this long counts as unreachable. Longer than the raw
 * timeout: a repository tree or a release list is a much bigger response than a file.
 */
const REQUEST_TIMEOUT_MS = 30_000

const cache = new Map<string, { at: number, value: unknown }>()

let apiBase = DEFAULT_API_BASE

/** Set once by the wizard from the value the server rendered, so a self-hosted api can be used. */
export function setGithubApiBase(base: string | undefined): void {
  apiBase = (base && base.trim().length > 0 ? base.trim() : DEFAULT_API_BASE).replace(/\/+$/, '')
}

export function clearGithubCache(): void {
  cache.clear()
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

export function encodeRepoPath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/')
}

// ---- Minimal API response shapes ---- //

export interface GithubUser {
  login: string
  name: string | null
  avatar_url: string
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
  permissions?: { admin?: boolean, push?: boolean, pull?: boolean }
  parent?: { full_name: string }
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

export interface GithubContentFile {
  type: 'file'
  path: string
  content?: string
  encoding?: string
}

/** The shape of `GET /repos/{repo}/compare/{base}...{head}` that the submission flow needs */
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

/** Self check: `node -e "import('./src/utils/github-api.ts').then(m => m.demo())"` */
export async function demo(): Promise<void> {
  const calls: string[] = []
  let respond: () => Response = () => new Response('{}', { status: 200 })
  const realFetch = globalThis.fetch
  globalThis.fetch = (async (url: URL | string) => {
    calls.push(String(url))
    return respond()
  }) as typeof fetch

  try {
    const fail = (what: string, value: unknown): never => {
      throw new Error(`github api demo failed: ${what}: ${JSON.stringify(value)}`)
    }

    cache.clear()
    setGithubApiBase('https://api.github.com')

    // 1. queries are encoded and the version header is sent
    respond = () => new Response(JSON.stringify({ ok: true }), { status: 200 })
    const first = await githubRequest<{ ok: boolean }>('/repos/a/b', { query: { ref: 'master', skip: undefined } })
    if (first.ok !== true) fail('response body', first)
    if (calls[0] !== 'https://api.github.com/repos/a/b?ref=master') fail('request url', calls[0])

    // 2. the same request is served from the cache for a while
    await githubRequest('/repos/a/b', { query: { ref: 'master', skip: undefined } })
    if (calls.length !== 1) fail('expected a cached response, fetch was called again', calls.length)

    // 3. a different path still goes out
    await githubRequest('/repos/a/c')
    if (calls.length !== 2) fail('expected a second request', calls.length)

    // 4. a used up anonymous quota is reported as such, and is not cached
    respond = () => new Response(JSON.stringify({ message: 'API rate limit exceeded' }), {
      status: 403,
      headers: { 'x-ratelimit-remaining': '0' },
    })
    let rateLimited: unknown = null
    try {
      await githubRequest('/repos/a/d')
    } catch (error) {
      rateLimited = error
    }
    if (!(rateLimited instanceof GithubApiError)) {
      throw new Error(`github api demo failed: expected a GithubApiError, got ${JSON.stringify(rateLimited)}`)
    }
    if (!rateLimited.rateLimited || rateLimited.status !== 403) fail('rate limit flag', rateLimited)
    if (rateLimited.apiMessage !== 'API rate limit exceeded') fail('api message', rateLimited.apiMessage)

    // 5. other failures keep their message and are not marked as rate limits
    respond = () => new Response(JSON.stringify({ message: 'Not Found' }), { status: 404 })
    let notFound: unknown = null
    try {
      await githubRequest('/repos/a/e')
    } catch (error) {
      notFound = error
    }
    if (!(notFound instanceof GithubApiError) || notFound.rateLimited || notFound.status !== 404) {
      fail('not found handling', notFound)
    }

    // 6. a self hosted api base is honoured, without a trailing slash
    setGithubApiBase('https://github.example.com/api/v3/')
    respond = () => new Response('{}', { status: 200 })
    calls.length = 0
    clearGithubCache()
    await githubRequest('/user')
    if (calls[0] !== 'https://github.example.com/api/v3/user') fail('custom api base', calls[0])

    console.log('github api demo passed')
  } finally {
    globalThis.fetch = realFetch
    setGithubApiBase(undefined)
    cache.clear()
  }
}
