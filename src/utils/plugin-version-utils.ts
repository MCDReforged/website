/**
 * Mirrors MCDR's version rules, so that the submission report does not advertise a release the
 * catalogue's own check (`ReleaseInfo.create_from` -> `Version(allow_wildcard=False)`) will refuse.
 */

/** MCDR's `EXTRA_ID_PATTERN`. It starts with an empty alternative, so an extra is allowed to be empty. */
const EXTRA = '[-+0-9A-Za-z]+(?:\\.[-+0-9A-Za-z]+)*'

/**
 * Dot separated integers, any number of them, followed by the optional `-pre` and `+build` extras.
 * Wildcards are not allowed, and every component has to parse as an integer.
 */
export const VERSION_PATTERN = new RegExp(`^\\d+(?:\\.\\d+)*(?:-(?:${EXTRA})?)?(?:\\+(?:${EXTRA})?)?$`)

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Reads the version out of a release tag. The catalogue accepts `<version>`, `v<version>`,
 * `<plugin id>-<version>` and `<plugin id>-v<version>`, and nothing else.
 *
 * Returns `null` when the catalogue would not accept this tag for this plugin.
 */
export function parseReleaseTagVersion(tag: string, pluginId: string): string | null {
  const match = new RegExp(`^(?:${escapeRegExp(pluginId)}-)?v?(.+)$`).exec(tag)
  if (match === null || !VERSION_PATTERN.test(match[1])) {
    return null
  }
  return match[1]
}

/** Self check: `node -e "import('./src/utils/plugin-version-utils.ts').then(m => m.demo())"` */
export function demo(): void {
  const accepted = ['1.2.3', '1', '1.2.3.4.5', '1.2.3-', '1.2.3+', '1.2.3-pre+build.5', '0.3.1-beta.1']
  const rejected = ['1abc', '1..2', '1.x', '1.2.3-..', '1.2.3+_bad', 'x', '', '-', '+']

  for (const version of accepted) {
    if (!VERSION_PATTERN.test(version)) {
      throw new Error(`plugin-version demo failed: MCDR accepts ${JSON.stringify(version)} but the pattern rejects it`)
    }
  }
  for (const version of rejected) {
    if (VERSION_PATTERN.test(version)) {
      throw new Error(`plugin-version demo failed: MCDR rejects ${JSON.stringify(version)} but the pattern accepts it`)
    }
  }

  const assert = (tag: string, expected: string | null, what: string) => {
    const actual = parseReleaseTagVersion(tag, 'my_plugin')
    if (actual !== expected) {
      throw new Error(`plugin-version demo failed: ${what}: ${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`)
    }
  }
  assert('1.2.3', '1.2.3', 'bare version')
  assert('v1.2.3', '1.2.3', 'v prefix')
  assert('my_plugin-0.3.1', '0.3.1', 'id prefix')
  assert('my_plugin-v0.2.4', '0.2.4', 'id and v prefix')
  assert('1abc', null, 'non numeric component')
  assert('1..2', null, 'empty component')
  assert('my_plugin-1.2.3', '1.2.3', 'id prefix with a valid version')
  assert('my_pluginX-1.2.3', null, 'id prefix must end at the dash')
  assert('other_plugin-1.2.3', null, 'another plugin id')
  assert('1.2.3', '1.2.3', 'a bare version is accepted for any id')

  console.log('plugin-version demo passed')
}
