export function levenshteinDistance(a: string, b: string): number {
  if (a === b) {
    return 0
  }
  if (a.length === 0) {
    return b.length
  }
  if (b.length === 0) {
    return a.length
  }

  let previous = new Array<number>(b.length + 1)
  let current = new Array<number>(b.length + 1)
  for (let j = 0; j <= b.length; j++) {
    previous[j] = j
  }

  for (let i = 1; i <= a.length; i++) {
    current[0] = i
    for (let j = 1; j <= b.length; j++) {
      const substitution = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, substitution)
    }
    const swap = previous
    previous = current
    current = swap
  }
  return previous[b.length]
}

export function closestId(target: string, candidates: string[]): { id: string, distance: number } | null {
  const lower = target.toLowerCase()
  let best: { id: string, distance: number } | null = null
  for (const candidate of candidates) {
    if (candidate === target) {
      continue
    }
    const distance = levenshteinDistance(lower, candidate.toLowerCase())
    if (best === null || distance < best.distance) {
      best = { id: candidate, distance }
    }
  }
  return best
}
