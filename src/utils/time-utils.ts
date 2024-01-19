import moment from "moment";

export function toTimeAgo(date?: Date): string | undefined {
  return date === undefined ? undefined : moment(date).fromNow();
}

export function formatTime(date?: Date, formatter: string = 'YYYY/MM/DD hh:mm:ss'): string | undefined {
  return date === undefined ? undefined : moment(date).format(formatter)
}

