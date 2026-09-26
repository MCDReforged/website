import { getCatalogueRepo } from '@/utils/environment-utils'
import { Guidelines } from '@/submit/types'

/** The catalogue ships one guideline file per supported language. */
const GUIDELINES_FILES: Record<string, string> = {
  'en': 'CONTRIBUTING.md',
  'zh-CN': 'CONTRIBUTING_zh_cn.md',
}

const FALLBACK_FILE = 'CONTRIBUTING.md'

/** Kept in sync with the `catalogue` tag used by the everything.json fetch. */
const REVALIDATE_SECONDS = 10 * 60

export function getGuidelinesFileName(locale: string): string {
  return GUIDELINES_FILES[locale] ?? FALLBACK_FILE
}

async function fetchGuidelinesMarkdown(repo: string, fileName: string): Promise<string | null> {
  try {
    // `HEAD` resolves to the repository's default branch, so a branch rename cannot break this
    const response = await fetch(`https://raw.githubusercontent.com/${repo}/HEAD/${fileName}`, {
      next: { revalidate: REVALIDATE_SECONDS, tags: ['catalogue'] },
    })
    if (!response.ok) {
      return null
    }
    return await response.text()
  } catch {
    // a guidelines fetch must never break the submission flow
    return null
  }
}

/**
 * Returns `null` when the guidelines cannot be loaded, so the caller can fall back to a plain link.
 */
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
