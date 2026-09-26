import type { PluginInfoAuthor } from './types'

/** MCDR's own plugin id rule: `[a-z][a-z0-9_]{0,63}` */
export const PLUGIN_ID_REGEX = /^[a-z][a-z0-9_]{0,63}$/

/** The catalogue asks for at least 3 characters unless there is a special reason. */
export const PLUGIN_ID_RECOMMENDED_MIN_LENGTH = 3

/** GitHub login shape, used to tell a login apart from a display name */
const GITHUB_LOGIN_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i

export interface RawPluginMetadata {
  id?: unknown
  name?: unknown
  version?: unknown
  description?: unknown
  authors?: unknown
  /** legacy single/plural author field */
  author?: unknown
  /** legacy author homepage */
  link?: unknown
  links?: { homepage?: string } | null
  dependencies?: unknown
}

export function isValidPluginId(id: string): boolean {
  return PLUGIN_ID_REGEX.test(id)
}

export function getPluginId(metadata: RawPluginMetadata): string | null {
  return typeof metadata.id === 'string' && isValidPluginId(metadata.id) ? metadata.id : null
}

export function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

/** `owner/name` or `.` */
export function normalizeRelatedPath(value: string): string {
  const trimmed = (value ?? '').trim().replace(/^\/+/, '').replace(/\/+$/, '')
  return trimmed.length === 0 ? '.' : trimmed
}

/**
 * Rejects paths that could escape the repository when fed to the GitHub contents API.
 */
export function isSafeRelatedPath(path: string): boolean {
  if (path === '.') {
    return true
  }
  if (path.length === 0 || path.startsWith('/') || path.includes('\\') || path.includes('\0')) {
    return false
  }
  return path.split('/').every(segment => segment.length > 0 && segment !== '.' && segment !== '..')
}

export interface AuthorLinkContext {
  /**
   * Canonical GitHub logins that are known to belong to the plugin, e.g. the repository owner
   * and the signed-in user. Only these are used to infer an author homepage, so that we never
   * invent a link to a GitHub account that may not exist.
   */
  preferredLogins?: string[]
}

function isGithubRepoUrl(link: string): boolean {
  let url: URL
  try {
    url = new URL(link)
  } catch {
    return false
  }
  if (url.hostname !== 'github.com' && url.hostname !== 'www.github.com') {
    return false
  }
  return url.pathname.split('/').filter(segment => segment.length > 0).length >= 2
}

function inferAuthorHomepage(name: string, context: AuthorLinkContext): string | undefined {
  if (!GITHUB_LOGIN_REGEX.test(name)) {
    return undefined
  }
  const login = context.preferredLogins?.find(item => item.toLowerCase() === name.toLowerCase())
  return login === undefined ? undefined : `https://github.com/${login}`
}

interface AuthorShape {
  name: string
  link?: string
}

function toAuthorShape(item: unknown): AuthorShape | null {
  if (typeof item === 'string') {
    const name = item.trim()
    return name.length > 0 ? { name } : null
  }
  if (item !== null && typeof item === 'object') {
    const record = item as Record<string, unknown>
    const name = typeof record.name === 'string' ? record.name.trim() : ''
    if (name.length === 0) {
      return null
    }
    const link = asString(record.link) ?? asString(record.homepage)
    return link === undefined ? { name } : { name, link }
  }
  return null
}

/**
 * The legacy `link` field is an author homepage, but it is very often filled with the plugin
 * repository url. Such a repository url is not a homepage, so it is replaced by the author's
 * GitHub profile when we can tell what it is, and dropped otherwise.
 */
function applyAuthorLinkPolicy(author: AuthorShape, context: AuthorLinkContext): PluginInfoAuthor {
  let link = author.link ?? ''
  if (link.length > 0 && isGithubRepoUrl(link)) {
    link = ''
  }
  if (link.length === 0) {
    link = inferAuthorHomepage(author.name, context) ?? ''
  }
  return link.length > 0 ? { name: author.name, link } : { name: author.name }
}

/** Reads both the modern `authors` field and the legacy `author` / `link` fields. */
export function normalizeAuthors(metadata: RawPluginMetadata, context: AuthorLinkContext = {}): PluginInfoAuthor[] {
  const source = metadata.authors !== undefined ? metadata.authors : metadata.author
  const items = Array.isArray(source) ? source : source === undefined || source === null ? [] : [source]
  const authors = items.map(toAuthorShape).filter((author): author is AuthorShape => author !== null)

  const legacyLink = asString(metadata.link)
  if (legacyLink !== undefined) {
    for (const author of authors) {
      if (author.link === undefined) {
        author.link = legacyLink
      }
    }
  }

  return authors.map(author => applyAuthorLinkPolicy(author, context))
}

/** Best effort plain-text description, preferring English then Chinese. */
export function getDescriptionText(metadata: RawPluginMetadata): string | undefined {
  const description = metadata.description
  if (typeof description === 'string') {
    return asString(description)
  }
  if (description !== null && typeof description === 'object') {
    const record = description as Record<string, unknown>
    for (const lang of ['en_us', 'zh_cn', ...Object.keys(record)]) {
      const value = asString(record[lang])
      if (value !== undefined) {
        return value
      }
    }
  }
  return undefined
}

export function getLinksHomepage(metadata: RawPluginMetadata): string | undefined {
  return asString(metadata.links?.homepage)
}

/** Self check: `node -e "import('./src/server/submit/metadata.ts').then(m => m.demo())"` */
export function demo(): void {
  const assert = (actual: unknown, expected: unknown, what: string) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`metadata demo failed: ${what}: ${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`)
    }
  }
  const ctx = { preferredLogins: ['alex3236', 'AnzhiZhang'] }

  // legacy `link` pointing at the plugin repository is not an author homepage
  assert(
    normalizeAuthors({ author: 'Alex3236', link: 'https://github.com/alex3236/UnifiedHandler' }, ctx),
    [{ name: 'Alex3236', link: 'https://github.com/alex3236' }],
    'repo url is replaced by the profile of the matching login',
  )

  // a real profile url is kept as is
  assert(
    normalizeAuthors({ authors: [{ name: 'Andy Zhang', link: 'https://github.com/AnzhiZhang' }] }, ctx),
    [{ name: 'Andy Zhang', link: 'https://github.com/AnzhiZhang' }],
    'profile url kept',
  )

  // a personal homepage is kept as is
  assert(
    normalizeAuthors({ author: 'MyFriend', link: 'https://www.myfriend.com' }, ctx),
    [{ name: 'MyFriend', link: 'https://www.myfriend.com' }],
    'non github homepage kept',
  )

  // unknown names never get an invented link
  assert(normalizeAuthors({ author: 'Someone' }, ctx), [{ name: 'Someone' }], 'no invented link')
  assert(normalizeAuthors({ author: 'Andy Zhang' }, ctx), [{ name: 'Andy Zhang' }], 'display name, no link')
  assert(
    normalizeAuthors({ author: 'Someone', link: 'https://github.com/someone/plugins' }, ctx),
    [{ name: 'Someone' }],
    'unknown repo url is dropped, not guessed',
  )
  assert(normalizeAuthors({ authors: ['Alex3236', { name: 'Someone' }] }, ctx), [
    { name: 'Alex3236', link: 'https://github.com/alex3236' },
    { name: 'Someone' },
  ], 'mixed list')

  // path safety
  assert(isSafeRelatedPath('.'), true, 'root')
  assert(isSafeRelatedPath('src/plugin'), true, 'nested')
  assert(isSafeRelatedPath('../etc'), false, 'traversal')
  assert(isSafeRelatedPath('a/../../b'), false, 'nested traversal')
  assert(isSafeRelatedPath('a//b'), false, 'empty segment')
  assert(isSafeRelatedPath('/abs'), false, 'absolute')
  assert(isSafeRelatedPath('a\\b'), false, 'backslash')

  console.log('metadata demo passed')
}
