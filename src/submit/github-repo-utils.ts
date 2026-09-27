import type { PluginInfoAuthor, PluginInfoJson } from '@/submit/types'

const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9_.-]*$/

const OTHER_URL = /^[a-z][a-z0-9+.-]*:\/\//i
const GITHUB_URL = /^(?:https?:\/\/)?(?:www\.)?github\.com\/(.+)$/i
const GITHUB_SSH = /^git@github\.com:([^/]+)\/(.+)$/i

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

const GITHUB_WEB = 'https://github.com'

export function buildForkUrl(catalogueRepo: string): string {
  return `${GITHUB_WEB}/${catalogueRepo}/fork`
}

export function buildNewFileUrl(targetRepo: string, branch: string, path: string, content: string): string {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/')
  return `${GITHUB_WEB}/${targetRepo}/new/${encodeURIComponent(branch)}`
    + `?filename=${encodedPath}&value=${encodeURIComponent(content)}`
}

export function ownerAuthor(repoSpec: string): PluginInfoAuthor | null {
  const owner = parseRepoSpec(repoSpec)?.split('/')[0]
  return owner === undefined || owner.length === 0
    ? null
    : { name: owner, link: `https://github.com/${owner}` }
}

export function buildPluginInfoJson(pluginInfo: PluginInfoJson): string {
  return JSON.stringify(pluginInfo, null, 4) + '\n'
}
