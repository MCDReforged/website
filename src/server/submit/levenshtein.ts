/**
 * Classic Levenshtein distance, used for the catalogue's "ids should not be too similar" guideline.
 */
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

/** Returns the closest candidate and its distance, or null when there is nothing to compare against. */
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

/** Self check: `node -e "import('./src/server/submit/levenshtein.ts').then(m => m.demo())"` */
export function demo(): void {
  const assert = (actual: unknown, expected: unknown, what: string) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`levenshtein demo failed: ${what}: ${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`)
    }
  }

  assert(levenshteinDistance('', ''), 0, 'empty')
  assert(levenshteinDistance('abc', ''), 3, 'empty b')
  assert(levenshteinDistance('kitten', 'sitting'), 3, 'classic')
  assert(levenshteinDistance('flaw', 'lawn'), 2, 'classic 2')
  assert(levenshteinDistance('ABC', 'abc'), 3, 'case sensitive')

  assert(closestId('quick_backup', ['quickbackupm', 'advanced_calculator']), { id: 'quickbackupm', distance: 2 }, 'closest')
  assert(closestId('tool', ['tool']), null, 'exact match is skipped')

  console.log('levenshtein demo passed')
}
