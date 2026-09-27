import { getCatalogueRepo } from '@/utils/environment-utils'
import { Guidelines } from '@/submit/types'

const GUIDELINES_FILES: Record<string, string> = {
  'en': 'CONTRIBUTING.md',
  'zh-CN': 'CONTRIBUTING_zh_cn.md',
}

const FALLBACK_FILE = 'CONTRIBUTING.md'

const REVALIDATE_SECONDS = 10 * 60

export function getGuidelinesFileName(locale: string): string {
  return GUIDELINES_FILES[locale] ?? FALLBACK_FILE
}

async function fetchGuidelinesMarkdown(repo: string, fileName: string): Promise<string | null> {
  try {
    const response = await fetch(`https://raw.githubusercontent.com/${repo}/HEAD/${fileName}`, {
      next: { revalidate: REVALIDATE_SECONDS, tags: ['catalogue'] },
    })
    if (!response.ok) {
      return null
    }
    return await response.text()
  } catch {
    return null
  }
}

export async function getGuidelines(locale: string): Promise<Guidelines | null> {
  const repo = getCatalogueRepo()
  const requested = getGuidelinesFileName(locale)

  let fileName = requested
  let markdown = await fetchGuidelinesMarkdown(repo, fileName)
  if (markdown === null && fileName !== FALLBACK_FILE) {
    fileName = FALLBACK_FILE
    markdown = await fetchGuidelinesMarkdown(repo, fileName)
  }
  if (markdown === null) {
    return null
  }

  return {
    markdown,
    fileName,
    baseUrl: `https://github.com/${repo}/blob/HEAD/`,
  }
}
