import { getGithubApiBase } from '@/utils/environment-utils'

export class GithubApiError extends Error {
  readonly status: number
  readonly apiMessage: string
  readonly body: unknown

  constructor(status: number, apiMessage: string, body?: unknown) {
    super(`GitHub API error ${status}: ${apiMessage}`)
    this.name = 'GithubApiError'
    this.status = status
    this.apiMessage = apiMessage
    this.body = body
  }

  /** True when the message mentions a missing object (stale fork object store, etc.) */
  get isMissingObject(): boolean {
    return this.status === 422 && /does not exist|not found/i.test(this.apiMessage)
  }

  get isReferenceExists(): boolean {
    return this.status === 422 && /already exists/i.test(this.apiMessage)
  }
}

export interface GithubRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  token?: string | null
  body?: unknown
  query?: Record<string, string | number | boolean | undefined>
  accept?: string
}

export async function githubRequest<T>(path: string, options: GithubRequestOptions = {}): Promise<T> {
  const url = new URL(getGithubApiBase() + path)
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  }

  const headers: Record<string, string> = {
    accept: options.accept ?? 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
    'user-agent': 'mcdreforged-website',
  }
  if (options.token) {
    headers.authorization = `Bearer ${options.token}`
  }
  if (options.body !== undefined) {
    headers['content-type'] = 'application/json'
  }

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
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
    throw new GithubApiError(response.status, message, data)
  }

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
  permissions?: { admin?: boolean; push?: boolean; pull?: boolean }
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

export interface GithubRelease {
  tag_name: string
  draft: boolean
  prerelease: boolean
  html_url?: string
  assets: { name: string }[]
}
