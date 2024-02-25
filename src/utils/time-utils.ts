import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn'

dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)

function get(date: Date, locale?: string) {
  let dj = dayjs(date)
  if (locale) {
    dj = dj.locale(locale.toLowerCase())
  }
  return dj
}

// NOTES: if SSR, the result might be wrong
export function getTimeAgo(date: Date, locale?: string): string {
  return get(date, locale).fromNow()
}

// NOTES: if SSR, the result might be wrong
export function formatTime(date: Date, formatter: string, locale?: string): string {
  return get(date, locale).format(formatter)
}

