import type { PluginInfoAuthor } from './types'

export const PLUGIN_ID_REGEX = /^[a-z][a-z0-9_]{0,63}$/

export const PLUGIN_ID_RECOMMENDED_MIN_LENGTH = 3

const GITHUB_LOGIN_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i

export interface RawPluginMetadata {
  id?: unknown
  name?: unknown
  version?: unknown
  description?: unknown
  authors?: unknown
  author?: unknown
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

export interface AuthorLinkContext {
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

  const resolved = authors.map(author => applyAuthorLinkPolicy(author, context))
  if (resolved.length > 0) {
    return resolved
  }
  const owner = context.preferredLogins?.[0]
  return owner === undefined ? [] : [{ name: owner, link: `https://github.com/${owner}` }]
}

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
