import moment from 'moment';
import 'moment/locale/zh-cn';

// NOTES: if SSR, the result might be wrong
export function getTimeAgo(date: Date, locale?: string): string {
  moment.locale(locale?.toLowerCase())
  return moment(date).fromNow()
}

export function formatTime(date: Date, formatter: string = 'YYYY/MM/DD hh:mm:ss', locale?: string): string {
  moment.locale(locale?.toLowerCase())
  return moment(date).format(formatter)
}

