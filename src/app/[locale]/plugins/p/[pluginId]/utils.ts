const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB']

export function PrettySize(size: number): string {
  for (let i = 0; i < units.length; i++) {
    if (size < 1024 || i === units.length - 1) {
      return `${size.toFixed(2)} ${units[i]}`
    }
    size /= 1024
  }
  return size.toString()  // should never reach here
}