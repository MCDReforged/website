import moment from 'moment';
import 'moment/locale/zh-cn';

export function getTimeAgo(date?: Date, locale?: string): string | undefined {
  moment.locale(locale?.toLowerCase())
  return date === undefined ? undefined : moment(date).fromNow();
}

export function formatTime(date?: Date, formatter: string = 'YYYY/MM/DD hh:mm:ss', locale?: string): string | undefined {
  moment.locale(locale?.toLowerCase())
  return date === undefined ? undefined : moment(date).format(formatter)
}

