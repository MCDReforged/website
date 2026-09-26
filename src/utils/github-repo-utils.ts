/**
 * Reading a repository out of what a user typed or pasted.
 *
 * The submission form only ever wants `owner/repository`, but people paste urls: the repository
 * page, a tree url for a branch, the address bar while browsing an issue. All of those name the
 * same repository, so they are accepted and reduced to `owner/repository`.
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

  // names with the characters github allows
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

  console.log('repo spec demo passed')
}
