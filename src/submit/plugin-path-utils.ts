
export function normalizeRelatedPath(value: string): string {
  const trimmed = (value ?? '')
    .trim()
    .replace(/^(?:\.\/)+/, '')  // `./src` is a natural way to write a relative directory
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
  return trimmed.length === 0 ? '.' : trimmed
}

export function isSafeRelatedPath(path: string): boolean {
  if (path === '.') {
    return true
  }
  if (path.length === 0 || path.startsWith('/') || path.includes('\\') || path.includes('\0')) {
    return false
  }
  return path.split('/').every(segment => segment.length > 0 && segment !== '.' && segment !== '..')
}

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

export function toPluginRelative(relatedPath: string, path: string): string {
  const base = relatedPath === '.' ? [] : relatedPath.split('/')
  const parts = path.split('/')
  let common = 0
  while (common < base.length && common < parts.length && base[common] === parts[common]) {
    common++
  }
  return [...Array<string>(base.length - common).fill('..'), ...parts.slice(common)].join('/')
}
