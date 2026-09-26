import type { PluginInfoAuthor, PluginInfoJson } from '@/submit/types'

/**
 * GitHub repository identifiers and urls.
 *
 * Reading a repository out of what a user typed or pasted is the first job here; the last one is
 * building the urls that hand the rest of the submission over to github.com.
 */

/** GitHub owner and repository names: letters, digits, `-`, `_` and `.`. */
const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9_.-]*$/

const OTHER_URL = /^[a-z][a-z0-9+.-]*:\/\//i
const GITHUB_URL = /^(?:https?:\/\/)?(?:www\.)?github\.com\/(.+)$/i
const GITHUB_SSH = /^git@github\.com:([^/]+)\/(.+)$/i

/**
 * Returns `owner/repository`, or `null` when the input does not name a GitHub repository.
 *
 * Accepted: `owner/repo`, `owner/repo/`, `https://github.com/owner/repo`,
 * `github.com/owner/repo`, `https://github.com/owner/repo/tree/branch/sub`, any other github.com
 * page of that repository (issues, releases, ...), `owner/repo.git` and `git@github.com:owner/repo.git`.
 * Anything past the repository name is ignored, only the first two segments are used.
 */
export function parseRepoSpec(input: string): string | null {
  let value = (input ?? '').trim()
  if (value.length === 0) {
    return null
  }

  const ssh = GITHUB_SSH.exec(value)
  if (ssh !== null) {
    value = `${ssh[1]}/${ssh[2]}`
  } else {
    const url = GITHUB_URL.exec(value)
    if (url !== null) {
      value = url[1]
    } else if (OTHER_URL.test(value)) {
      return null  // a url, but not on github.com
    }
  }

  value = value.split(/[?#]/)[0].replace(/\/+$/, '').replace(/\.git$/i, '')

  const segments = value.split('/').filter(segment => segment.length > 0)
  if (segments.length < 2) {
    return null
  }
  const [owner, name] = segments
  if (!SEGMENT.test(owner) || !SEGMENT.test(name)) {
    return null
  }
  return `${owner}/${name}`
}

/** Self check: `node -e "import('./src/utils/github-repo-utils.ts').then(m => m.demo())"` */
export function demo(): void {
  const accept = (input: string, expected: string) => {
    const actual = parseRepoSpec(input)
    if (actual !== expected) {
      throw new Error(`repo spec demo failed: ${JSON.stringify(input)}: ${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`)
    }
  }
  const reject = (input: string) => {
    const actual = parseRepoSpec(input)
    if (actual !== null) {
      throw new Error(`repo spec demo failed: ${JSON.stringify(input)} should be rejected, got ${JSON.stringify(actual)}`)
    }
  }

  accept('alex3236/mcdr-submit-test', 'alex3236/mcdr-submit-test')
  accept('  alex3236/mcdr-submit-test  ', 'alex3236/mcdr-submit-test')
  accept('alex3236/mcdr-submit-test/', 'alex3236/mcdr-submit-test')
  accept('MCDReforged/ExamplePlugin', 'MCDReforged/ExamplePlugin')

  // the url from the address bar, whatever page of the repository it is on
  accept('https://github.com/alex3236/mcdr-submit-test', 'alex3236/mcdr-submit-test')
  accept('http://github.com/alex3236/mcdr-submit-test', 'alex3236/mcdr-submit-test')
  accept('github.com/alex3236/mcdr-submit-test', 'alex3236/mcdr-submit-test')
  accept('www.github.com/alex3236/mcdr-submit-test', 'alex3236/mcdr-submit-test')
  accept('https://github.com/alex3236/mcdr-submit-test/', 'alex3236/mcdr-submit-test')
  accept('https://github.com/alex3236/mcdr-submit-test/tree/master', 'alex3236/mcdr-submit-test')
  accept('https://github.com/AnzhiZhang/MCDReforgedPlugins/tree/master/src/qq_chat', 'AnzhiZhang/MCDReforgedPlugins')
  accept('https://github.com/alex3236/mcdr-submit-test/blob/master/README.md', 'alex3236/mcdr-submit-test')
  accept('https://github.com/alex3236/mcdr-submit-test/issues', 'alex3236/mcdr-submit-test')
  accept('https://github.com/alex3236/mcdr-submit-test/releases/tag/v0.1.0', 'alex3236/mcdr-submit-test')
  accept('https://github.com/alex3236/mcdr-submit-test?tab=readme-ov-file', 'alex3236/mcdr-submit-test')
  accept('https://github.com/alex3236/mcdr-submit-test#readme', 'alex3236/mcdr-submit-test')
  accept('https://github.com/alex3236/mcdr-submit-test.git', 'alex3236/mcdr-submit-test')
  accept('git@github.com:alex3236/mcdr-submit-test.git', 'alex3236/mcdr-submit-test')

  accept('my-org/my.repo_name', 'my-org/my.repo_name')
  // empty segments are dropped rather than rejected, they are a typo either way
  accept('alex3236//mcdr-submit-test', 'alex3236/mcdr-submit-test')
  accept('//alex3236/mcdr-submit-test', 'alex3236/mcdr-submit-test')

  reject('')
  reject('   ')
  reject('alex3236')
  reject('https://github.com/alex3236')
  reject('https://github.com/')
  reject('https://gitlab.com/alex3236/mcdr-submit-test')
  reject('https://example.com')
  reject('/mcdr-submit-test')
  reject('-bad/name')

  // ---- submission links ---- //
  const fail = (what: string, value: unknown) => {
    throw new Error(`repo spec demo failed: ${what}: ${JSON.stringify(value)}`)
  }

  const forkUrl = buildForkUrl('MCDReforged/PluginCatalogue')
  if (forkUrl !== 'https://github.com/MCDReforged/PluginCatalogue/fork') {
    fail('fork url', forkUrl)
  }

  const json = buildPluginInfoJson({
    id: 'my_plugin',
    authors: [{ name: 'Me' }],
    repository: 'https://github.com/me/plugin',
    branch: 'master',
    related_path: '.',
    labels: ['tool'],
    introduction: { en_us: 'README.md' },
  })
  if (!json.endsWith('\n') || !json.includes('\n    "id"')) {
    fail('plugin_info.json should be indented json ending in a newline', json)
  }
  if (JSON.parse(json).id !== 'my_plugin') {
    fail('plugin_info.json does not round trip', json)
  }

  const newFileUrl = new URL(buildNewFileUrl(
    'alex3236/PluginCatalogue', 'master', 'plugins/my_plugin/plugin_info.json', json,
  ))
  if (newFileUrl.origin + newFileUrl.pathname !== 'https://github.com/alex3236/PluginCatalogue/new/master') {
    fail('new file url', newFileUrl.href)
  }
  if (newFileUrl.searchParams.get('filename') !== 'plugins/my_plugin/plugin_info.json') {
    fail('filename parameter', newFileUrl.searchParams.get('filename'))
  }
  // whatever github reads back out of the url has to be the file we mean to commit
  if (newFileUrl.searchParams.get('value') !== json) {
    fail('value parameter does not round trip', newFileUrl.searchParams.get('value'))
  }

  const owner = ownerAuthor('alex3236/mcdr-submit-test')
  if (owner?.name !== 'alex3236' || owner?.link !== 'https://github.com/alex3236') {
    fail('owner author', owner)
  }
  if (ownerAuthor('not a repo') !== null) {
    fail('owner author for an unusable spec', ownerAuthor('not a repo'))
  }

  console.log('repo spec demo passed')
}

// ---- submission links ---- //

const GITHUB_WEB = 'https://github.com'

/**
 * The page that creates a fork of the catalogue under the signed-in account.
 *
 * Deliberately without query parameters: github's fork flow runs on this url and rejects the
 * `filename` / `value` parameters of the file editor, so the fork has to be a step of its own.
 */
export function buildForkUrl(catalogueRepo: string): string {
  return `${GITHUB_WEB}/${catalogueRepo}/fork`
}

/**
 * The "create a file" page of a repository the user can write to, with the path and the content
 * filled in. That is either their fork, or the catalogue itself for its maintainers. Only usable
 * once the target repository exists — github's fork flow does not carry these parameters.
 */
export function buildNewFileUrl(targetRepo: string, branch: string, path: string, content: string): string {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/')
  return `${GITHUB_WEB}/${targetRepo}/new/${encodeURIComponent(branch)}`
    + `?filename=${encodedPath}&value=${encodeURIComponent(content)}`
}

/**
 * The author to offer when nothing else is known: the repository owner, credited with their profile.
 * Also used when the repository cannot be read at all, so the field is never left empty for the user.
 */
export function ownerAuthor(repoSpec: string): PluginInfoAuthor | null {
  const owner = parseRepoSpec(repoSpec)?.split('/')[0]
  return owner === undefined || owner.length === 0
    ? null
    : { name: owner, link: `https://github.com/${owner}` }
}

/** The file to be committed, matching the formatting the catalogue already uses. */
export function buildPluginInfoJson(pluginInfo: PluginInfoJson): string {
  return JSON.stringify(pluginInfo, null, 4) + '\n'
}
