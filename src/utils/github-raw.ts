/**
 * File access through `raw.githubusercontent.com`.
 *
 * The API quota (60 anonymous requests per hour and address) does not apply here, so this is what
 * still works when nothing else does. Anything with a *known path* — the plugin metadata, the
 * introduction files, a licence, a catalogue entry — can be checked this way.
 */

const RAW_BASE = 'https://raw.githubusercontent.com'

export function rawFileUrl(repo: string, ref: string, path: string): string {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/')
  return `${RAW_BASE}/${repo}/${encodeURIComponent(ref)}/${encodedPath}`
}

/**
 * The file's text, or `null` when the file is not there.
 *
 * A network failure is *not* the same answer and is left to propagate: "the file is missing" is a
 * finding, "we could not ask" is not.
 */
export async function readRawFile(repo: string, ref: string, path: string): Promise<string | null> {
  const response = await fetch(rawFileUrl(repo, ref, path), { cache: 'no-store' })
  return response.ok ? await response.text() : null
}

/** Whether the file exists. Cheaper than reading it when only existence matters. */
export async function rawFileExists(repo: string, ref: string, path: string): Promise<boolean> {
  const response = await fetch(rawFileUrl(repo, ref, path), { method: 'HEAD', cache: 'no-store' })
  return response.ok
}

/** The first of `paths` that exists, or `null` when none does. */
export async function firstExistingRawFile(repo: string, ref: string, paths: string[]): Promise<string | null> {
  const results = await Promise.all(paths.map(async path => [path, await rawFileExists(repo, ref, path)] as const))
  return results.find(([, exists]) => exists)?.[0] ?? null
}

/** Self check: `node -e "import('./src/utils/github-raw.ts').then(m => m.demo())"` */
export async function demo(): Promise<void> {
  const calls: { url: string, method: string }[] = []
  let respond: (url: string) => Response = () => new Response('{}', { status: 200 })
  const realFetch = globalThis.fetch
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    calls.push({ url, method: init?.method ?? 'GET' })
    return respond(url)
  }) as typeof fetch

  try {
    const fail = (what: string, value: unknown): never => {
      throw new Error(`github raw demo failed: ${what}: ${JSON.stringify(value)}`)
    }

    // paths and refs are escaped, but the separators are not
    const url = rawFileUrl('AnzhiZhang/MCDReforgedPlugins', 'feat/some branch', 'src/qq chat/README.md')
    if (url !== 'https://raw.githubusercontent.com/AnzhiZhang/MCDReforgedPlugins/feat%2Fsome%20branch/src/qq%20chat/README.md') {
      fail('url', url)
    }

    // a file that is there
    respond = () => new Response('{"id":"my_plugin"}', { status: 200 })
    if (await readRawFile('a/b', 'master', 'mcdreforged.plugin.json') !== '{"id":"my_plugin"}') {
      fail('read existing file', calls)
    }

    // a file that is not: every failure mode reads as "not there", never as an exception
    respond = () => new Response('404: Not Found', { status: 404 })
    if (await readRawFile('a/b', 'master', 'missing.json') !== null) {
      fail('read missing file', calls)
    }
    if (await rawFileExists('a/b', 'master', 'missing.json')) {
      fail('existence of a missing file', calls)
    }
    // a broken network must not read as "the file is not there"
    respond = () => { throw new Error('network down') }
    for (const attempt of [() => readRawFile('a/b', 'master', 'LICENSE'), () => rawFileExists('a/b', 'master', 'LICENSE')]) {
      let threw = false
      try {
        await attempt()
      } catch {
        threw = true
      }
      if (!threw) {
        fail('a network failure should propagate, not be reported as a missing file', calls)
      }
    }

    // existence uses HEAD, and the first hit wins
    calls.length = 0
    respond = url => new Response('', { status: url.endsWith('LICENCE') ? 200 : 404 })
    const found = await firstExistingRawFile('a/b', 'master', ['LICENSE', 'LICENCE', 'COPYING'])
    if (found !== 'LICENCE') {
      fail('first existing file', found)
    }
    if (calls.some(call => call.method !== 'HEAD')) {
      fail('existence checks should use HEAD', calls)
    }
    respond = () => new Response('', { status: 404 })
    if (await firstExistingRawFile('a/b', 'master', ['LICENSE', 'COPYING']) !== null) {
      fail('no existing file', calls)
    }

    console.log('github raw demo passed')
  } finally {
    globalThis.fetch = realFetch
  }
}
