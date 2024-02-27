import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/zh-cn'

dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)
dayjs.extend(utc)

function get(date: Date, locale?: string, useUtc?: boolean) {
  let dj = dayjs(date)
  if (locale) {
    dj = dj.locale(locale.toLowerCase())
  }
  if (useUtc) {
    dj = dj.utc(false)
  }
  return dj
}

// NOTES: if SSR, the result might be wrong, unless useUtc === true
// Use <TimeAgo/> whenever possible
export function getTimeAgo(date: Date, locale?: string, useUtc?: boolean): string {
  return get(date, locale, useUtc).fromNow()
}

// NOTES: if SSR, the result might be wrong, unless useUtc === true
// Use <TimeFormatted/> whenever possible
export function formatTime(date: Date, formatter: string, locale?: string, useUtc?: boolean): string {
  return get(date, locale, useUtc).format(formatter)
}

