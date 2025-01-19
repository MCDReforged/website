export function arraySum(numbers: number[]): number {
  return numbers.reduce((v, s) => v + s, 0)
}

export function arrayMax(numbers: number[]): number {
  return numbers.reduce((max, v) => (v > max ? v : max), numbers[0])
}

export function arrayMin(numbers: number[]): number {
  return numbers.reduce((min, v) => (v < min ? v : min), numbers[0])
}

