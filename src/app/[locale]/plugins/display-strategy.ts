import { SimplePlugin } from "@/catalogue/simple-types";
import { Dispatch, SetStateAction } from "react";

export const sortOrders: string[] = [
  'name',
  'downloads',
  'recentUpdate',
]

export interface DisplayStrategy {
  page: number | null

  nameKeyword: string
  authorKeyword: string

  selectedLabels: string[]
  sortOrder: string | null
  sortReversed: boolean
}

export interface DisplayStrategyContextValue {
  ds: DisplayStrategy
  setDs: Dispatch<SetStateAction<DisplayStrategy>>
}

function isSubsequence(keyword: string, s: string) {
  let idx = 0;
  for (let i = 0; i < s.length && idx < keyword.length; i++) {
    if (s[i] === keyword[idx]) {
      idx++;
    }
  }
  return idx === keyword.length;
}

export function filterPlugins(plugins: SimplePlugin[], ds: DisplayStrategy) {
  return plugins.filter((plugin: SimplePlugin) => {
    if (ds.nameKeyword !== '') {
      const kw = ds.nameKeyword.toLowerCase()
      const id = plugin.id.toLowerCase()
      const name = plugin.name.toLowerCase()
      if (!isSubsequence(kw, id) && !isSubsequence(kw, name)) {
        return false
      }
    }
    if (ds.authorKeyword !== '') {
      const kw = ds.authorKeyword.toLowerCase()
      const filtered = plugin.authors.filter((author) => isSubsequence(kw, author.name.toLowerCase()))
      if (filtered.length === 0) {
        return false
      }
    }
    if (ds.selectedLabels.length > 0) {
      const set = new Set(ds.selectedLabels);
      if (!plugin.labels.some(item => set.has(item))) {
        return false
      }
    }
    return true
  })
}
