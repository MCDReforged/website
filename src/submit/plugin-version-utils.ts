
const EXTRA = '[-+0-9A-Za-z]+(?:\\.[-+0-9A-Za-z]+)*'

export const VERSION_PATTERN = new RegExp(`^\\d+(?:\\.\\d+)*(?:-(?:${EXTRA})?)?(?:\\+(?:${EXTRA})?)?$`)

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function parseReleaseTagVersion(tag: string, pluginId: string): string | null {
  const match = new RegExp(`^(?:${escapeRegExp(pluginId)}-)?v?(.+)$`).exec(tag)
  if (match === null || !VERSION_PATTERN.test(match[1])) {
    return null
  }
  return match[1]
}
