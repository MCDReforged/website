export const sortOrders = [
  'name',
  'downloads',
  'lastUpdate',
] as const

export type SortOrder = typeof sortOrders[number];

export interface DisplayStrategy {
  keyword: string
  sortOrder: SortOrder
  sortReversed: boolean
}
