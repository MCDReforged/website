import { Dispatch, SetStateAction } from "react";

export const sortOrders: string[] = [
  'name',
  'downloads',
  'recentUpdate',
]

export interface DisplayStrategy {
  page: number | null
  keyword: string
  selectedLabels: string[]
  sortOrder: string | null
  sortReversed: boolean
}

export interface DisplayStrategyContextValue {
  ds: DisplayStrategy
  setDs: Dispatch<SetStateAction<DisplayStrategy>>
}
