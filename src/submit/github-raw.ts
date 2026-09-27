
// raw has no request quota, so anything with a known path is read from here rather than the api
const RAW_BASE = 'https://raw.githubusercontent.com'

const RAW_TIMEOUT_MS = 15_000

export function rawFileUrl(repo: string, ref: string, path: string): string {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/')
  return `${RAW_BASE}/${repo}/${encodeURIComponent(ref)}/${encodedPath}`
}

// a network failure is not a missing file: it propagates, and the caller decides what that means
export async function readRawFile(repo: string, ref: string, path: string): Promise<string | null> {
  const response = await fetch(rawFileUrl(repo, ref, path), {
    cache: 'no-store',
    signal: AbortSignal.timeout(RAW_TIMEOUT_MS),
  })
  return response.ok ? await response.text() : null
}

export async function rawFileExists(repo: string, ref: string, path: string): Promise<boolean> {
  const response = await fetch(rawFileUrl(repo, ref, path), {
    method: 'HEAD',
    cache: 'no-store',
    signal: AbortSignal.timeout(RAW_TIMEOUT_MS),
  })
  return response.ok
}

export async function firstExistingRawFile(repo: string, ref: string, paths: string[]): Promise<string | null> {
  const results = await Promise.all(paths.map(async path => [path, await rawFileExists(repo, ref, path)] as const))
  return results.find(([, exists]) => exists)?.[0] ?? null
}
