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

export const FILE_TIMEOUT_MS = 15_000

const API_TIMEOUT_MS = 30_000

// the largest metadata file in the catalogue is under a kilobyte
export const FILE_MAX_BYTES = 100 * 1024

// the largest tree in the catalogue is about 190 KiB, and github stops at 7 MiB
export const API_MAX_BYTES = 1024 * 1024

const cache = new Map<string, { at: number, value: unknown }>()

let apiBase = DEFAULT_API_BASE

function readCache<T>(key: string): T | undefined {
  const hit = cache.get(key)
  if (hit === undefined || Date.now() - hit.at >= CACHE_TTL_MS) {
    return undefined
  }
  return hit.value as T
}

function writeCache(key: string, value: unknown): void {
  cache.set(key, { at: Date.now(), value })
}

export async function readTextUpTo(response: Response, maxBytes: number): Promise<string> {
  const declared = Number(response.headers.get('content-length'))
  if (Number.isFinite(declared) && declared > maxBytes) {
    await response.body?.cancel().catch(() => undefined)
    throw new Error(`response is larger than ${maxBytes} bytes`)
  }
  if (response.body === null) {
    return await response.text()
  }
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let text = ''
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    size += value.byteLength
    if (size > maxBytes) {
      await reader.cancel().catch(() => undefined)
      throw new Error(`response is larger than ${maxBytes} bytes`)
    }
    text += decoder.decode(value, { stream: true })
  }
  return text + decoder.decode()
}

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
  const cached = readCache<T>(key)
  if (cached !== undefined) {
    return cached
  }

  const response = await fetch(url, {
    headers: {
      accept: options.accept ?? 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  })

  const text = await readTextUpTo(response, API_MAX_BYTES)
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

  writeCache(key, data)
  return data as T
}

export function rawFileUrl(repo: string, ref: string, path: string): string {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/')
  return `https://raw.githubusercontent.com/${repo}/${encodeURIComponent(ref)}/${encodedPath}`
}

// a network failure is not a missing file: it propagates, and the caller decides what that means
export async function readRawFile(repo: string, ref: string, path: string): Promise<string | null> {
  const key = `GET ${rawFileUrl(repo, ref, path)}`
  const cached = readCache<string | null>(key)
  if (cached !== undefined) {
    return cached
  }
  const response = await fetch(rawFileUrl(repo, ref, path), {
    cache: 'no-store',
    signal: AbortSignal.timeout(FILE_TIMEOUT_MS),
  })
  const content = response.ok ? await readTextUpTo(response, FILE_MAX_BYTES) : null
  writeCache(key, content)
  return content
}

export async function rawFileExists(repo: string, ref: string, path: string): Promise<boolean> {
  const key = `HEAD ${rawFileUrl(repo, ref, path)}`
  const cached = readCache<boolean>(key)
  if (cached !== undefined) {
    return cached
  }
  const response = await fetch(rawFileUrl(repo, ref, path), {
    method: 'HEAD',
    cache: 'no-store',
    signal: AbortSignal.timeout(FILE_TIMEOUT_MS),
  })
  writeCache(key, response.ok)
  return response.ok
}

export async function firstExistingRawFile(repo: string, ref: string, paths: string[]): Promise<string | null> {
  const results = await Promise.all(paths.map(async path => [path, await rawFileExists(repo, ref, path)] as const))
  return results.find(([, exists]) => exists)?.[0] ?? null
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
