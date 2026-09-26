/**
 * Path handling for `plugin_info.json`.
 *
 * These helpers are pure and shared: the server uses them to validate a submission, the browser
 * wizard uses them to turn the repository's file list into the paths the catalogue expects.
 */

/** `related_path` normalisation. `.` means the repository root. */
export function normalizeRelatedPath(value: string): string {
  const trimmed = (value ?? '')
    .trim()
    .replace(/^(?:\.\/)+/, '')  // `./src` is a natural way to write a relative directory
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
  return trimmed.length === 0 ? '.' : trimmed
}

/** Rejects paths that could escape the repository when fed to the GitHub contents API. */
export function isSafeRelatedPath(path: string): boolean {
  if (path === '.') {
    return true
  }
  if (path.length === 0 || path.startsWith('/') || path.includes('\\') || path.includes('\0')) {
    return false
  }
  return path.split('/').every(segment => segment.length > 0 && segment !== '.' && segment !== '..')
}

/**
 * `introduction` values are relative to `related_path` and may walk out of it
 * (`../docs/README.md`), exactly like `GithubRepository.resolve_raw(..., in_plugin_relative=True)`
 * resolves them in the catalogue.
 *
 * Returns the repository root relative path, or `null` when the path escapes the repository.
 */
export function resolvePluginRelative(relatedPath: string, path: string): string | null {
  const segments = relatedPath === '.' ? [] : relatedPath.split('/')
  for (const segment of path.split('/')) {
    if (segment === '' || segment === '.') {
      continue
    }
    if (segment === '..') {
      if (segments.length === 0) {
        return null
      }
      segments.pop()
      continue
    }
    segments.push(segment)
  }
  return segments.length === 0 ? null : segments.join('/')
}

/** Inverse of {@link resolvePluginRelative}: how a repository root relative path is written from inside `relatedPath`. */
export function toPluginRelative(relatedPath: string, path: string): string {
  const base = relatedPath === '.' ? [] : relatedPath.split('/')
  const parts = path.split('/')
  let common = 0
  while (common < base.length && common < parts.length && base[common] === parts[common]) {
    common++
  }
  return [...Array<string>(base.length - common).fill('..'), ...parts.slice(common)].join('/')
}

/** Self check: `node -e "import('./src/utils/plugin-path-utils.ts').then(m => m.demo())"` */
export function demo(): void {
  const assert = (actual: unknown, expected: unknown, what: string) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`plugin-path demo failed: ${what}: ${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`)
    }
  }

  // ---- related_path normalisation and safety ---- //
  assert(normalizeRelatedPath('src'), 'src', 'plain')
  assert(normalizeRelatedPath('./src'), 'src', 'leading ./')
  assert(normalizeRelatedPath('././src'), 'src', 'repeated leading ./')
  assert(normalizeRelatedPath('./'), '.', 'just ./')
  assert(normalizeRelatedPath('/src/'), 'src', 'surrounding slashes')
  assert(normalizeRelatedPath('  '), '.', 'blank')

  assert(isSafeRelatedPath('.'), true, 'root')
  assert(isSafeRelatedPath('src/plugin'), true, 'nested')
  assert(isSafeRelatedPath('../etc'), false, 'traversal')
  assert(isSafeRelatedPath('a/../../b'), false, 'nested traversal')
  assert(isSafeRelatedPath('a//b'), false, 'empty segment')
  assert(isSafeRelatedPath('/abs'), false, 'absolute')
  assert(isSafeRelatedPath('a\\b'), false, 'backslash')
  assert(isSafeRelatedPath(normalizeRelatedPath('../x')), false, 'normalisation must not hide traversal')

  // ---- plugin relative introduction paths ---- //
  // real data from the catalogue: plugins/auto_cleaner/plugin_info.json
  assert(resolvePluginRelative('source', '../docs/README.md'), 'docs/README.md', 'walks out of the plugin dir')
  assert(resolvePluginRelative('source', 'README.md'), 'source/README.md', 'stays inside the plugin dir')
  assert(resolvePluginRelative('.', 'README.md'), 'README.md', 'root plugin')
  assert(resolvePluginRelative('.', './README.md'), 'README.md', 'leading ./')
  assert(resolvePluginRelative('.', '../README.md'), null, 'must not escape the repository')
  assert(resolvePluginRelative('a/b', '../../x.md'), 'x.md', 'walks to the repository root')
  assert(resolvePluginRelative('a/b', '../../../x.md'), null, 'one level too far')

  // the two helpers must round trip, that is what keeps the wizard and the validator agreeing
  for (const relatedPath of ['.', 'src', 'src/plugin', 'a/b/c']) {
    for (const rootPath of ['README.md', 'src/README.md', 'src/plugin/docs/x.md', 'a/b/c/d/e.md']) {
      const pluginRelative = toPluginRelative(relatedPath, rootPath)
      assert(resolvePluginRelative(relatedPath, pluginRelative), rootPath, `round trip ${relatedPath} ${rootPath}`)
    }
  }
  assert(toPluginRelative('source', 'docs/README.md'), '../docs/README.md', 'inverse of the catalogue example')
  assert(toPluginRelative('.', 'README.md'), 'README.md', 'root stays bare')

  console.log('plugin-path demo passed')
}
