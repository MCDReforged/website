/**
 * Redirect path handling for the OAuth round trip.
 */

/**
 * The url parser strips tab, line feed and carriage return before parsing, so `/\t/evil.com`
 * becomes the protocol relative `//evil.com`. The raw value has to be checked for that.
 */
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/

/**
 * A throwaway origin. Only a value that stays on this origin is an internal path; `//evil.com`,
 * `https://evil.com`, `https:evil.com` and `/\evil.com` all resolve away from it.
 */
const THROWAWAY_ORIGIN = 'https://mcdr-website.invalid'

/** Returns `value` when it is a path on this site, `fallback` otherwise. */
export function safeRedirectPath(value: string | null, fallback: string): string {
  if (value === null || value.length === 0 || CONTROL_CHARACTERS.test(value)) {
    return fallback
  }

  let parsed: URL
  try {
    parsed = new URL(value, THROWAWAY_ORIGIN)
  } catch {
    return fallback
  }
  if (parsed.origin !== THROWAWAY_ORIGIN) {
    return fallback
  }

  const path = parsed.pathname + parsed.search + parsed.hash
  return path.startsWith('/') ? path : fallback
}

/** Self check: `node -e "import('./src/utils/redirect-utils.ts').then(m => m.demo())"` */
export function demo(): void {
  const assert = (value: string | null, expected: string, what: string) => {
    const actual = safeRedirectPath(value, '/submit')
    if (actual !== expected) {
      throw new Error(`redirect demo failed: ${what}: ${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`)
    }
  }

  assert(null, '/submit', 'missing')
  assert('', '/submit', 'empty')
  assert('/zh-CN/submit', '/zh-CN/submit', 'internal path')
  assert('/submit?error=disabled', '/submit?error=disabled', 'query kept')
  assert('/a#b', '/a#b', 'hash kept')
  assert('zh-CN/submit', '/zh-CN/submit', 'relative resolves internally')

  // the open redirect these checks exist for
  assert('/\t/evil.com', '/submit', 'tab smuggles a protocol relative url')
  assert('/\n/evil.com', '/submit', 'lf smuggles a protocol relative url')
  assert('/\r/evil.com', '/submit', 'cr smuggles a protocol relative url')
  assert('//evil.com', '/submit', 'protocol relative')
  assert('///evil.com', '/submit', 'three slashes')
  assert('/\\evil.com', '/submit', 'backslash is a path separator for special schemes')
  assert('https://evil.com', '/submit', 'absolute')
  // when the scheme matches the base, the url parser treats it as a path reference: still internal
  assert('https:evil.com', '/evil.com', 'same scheme stays internal')
  assert('http:evil.com', '/submit', 'other scheme is absolute')
  assert('javascript:alert(1)', '/submit', 'other scheme')
  assert('http://mcdr-website.invalid.evil.com', '/submit', 'suffix lookalike origin')
  assert('https://mcdr-website.invalid@evil.com', '/submit', 'userinfo trick')

  console.log('redirect demo passed')
}
