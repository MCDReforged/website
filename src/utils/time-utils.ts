import moment from "moment";

export function toTimeAgo(date?: Date): string | undefined {
  return date === undefined ? undefined : moment(date).fromNow();
}

export function formatLocalTime(date?: Date): string | undefined {
  return date === undefined ? undefined : moment(date).format('YYYY/MM/DD hh:mm:ss')
}

