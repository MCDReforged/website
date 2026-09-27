import { FILE_MAX_BYTES, FILE_TIMEOUT_MS, rawFileUrl, readTextUpTo } from './github'
import { Guidelines } from './types'

const GUIDELINES_FILES: Record<string, string> = {
  'en': 'CONTRIBUTING.md',
  'zh-CN': 'CONTRIBUTING_zh_cn.md',
}

const FALLBACK_FILE = 'CONTRIBUTING.md'

const REVALIDATE_SECONDS = 10 * 60

function guidelinesFileName(locale: string): string {
  return GUIDELINES_FILES[locale] ?? FALLBACK_FILE
}

async function fetchGuidelinesMarkdown(repo: string, fileName: string): Promise<string | null> {
  try {
    const response = await fetch(rawFileUrl(repo, 'HEAD', fileName), {
      next: { revalidate: REVALIDATE_SECONDS, tags: ['catalogue'] },
      signal: AbortSignal.timeout(FILE_TIMEOUT_MS),
    })
    if (!response.ok) {
      return null
    }
    return await readTextUpTo(response, FILE_MAX_BYTES)
  } catch {
    return null
  }
}

export async function getGuidelines(locale: string, catalogueRepo: string): Promise<Guidelines | null> {
  const requested = guidelinesFileName(locale)

  let fileName = requested
  let markdown = await fetchGuidelinesMarkdown(catalogueRepo, fileName)
  if (markdown === null && fileName !== FALLBACK_FILE) {
    fileName = FALLBACK_FILE
    markdown = await fetchGuidelinesMarkdown(catalogueRepo, fileName)
  }
  if (markdown === null) {
    return null
  }

  return {
    markdown,
    fileName,
    baseUrl: `https://github.com/${catalogueRepo}/blob/HEAD/`,
    rawBaseUrl: `https://raw.githubusercontent.com/${catalogueRepo}/HEAD/`,
  }
}
