function pretty(size: number, ndigits: number | undefined, step: number, units: string[]): string {
  for (let i = 0; i < units.length; i++) {
    if (size < step || i === units.length - 1) {
      const num = size.toFixed(ndigits ?? 2)
      if (units[i]) {
        return `${num} ${units[i]}`
      } else {
        return num
      }
    }
    size /= step
  }
  return size.toString()  // should never reach here
}

export function prettySize(size: number, ndigits?: number): string {
  return pretty(size, ndigits, 1024, ['B', 'KiB', 'MiB', 'GiB', 'TiB'])
}

export function prettyNumber(size: number, ndigits?: number): string {
  return pretty(size, ndigits, 1000, ['', 'K', 'M'])
}
