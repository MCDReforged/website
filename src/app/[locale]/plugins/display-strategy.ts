import { SimplePlugin } from "@/catalogue/simple-types";
import { Dispatch, SetStateAction } from "react";

interface SortOrderConfig {
  key: string
  default?: boolean
}

const sortOrderConfig: SortOrderConfig[] = [
  {key: 'name'},
  {key: 'downloads'},
  {key: 'recentUpdate', default: true},
]
export const sortOrders: string[] = sortOrderConfig.map(cfg => cfg.key)
export const sortOrderDefault: string = sortOrderConfig.filter(cfg => cfg.default)[0].key

export interface DisplayStrategy {
  page: number | null

  nameKeyword: string
  authorKeyword: string

  selectedLabels: string[]
  sortOrder: string | null
  sortReversed: boolean
}
export interface DisplayStrategyHolder {
  value: DisplayStrategy
}

export interface DisplayStrategyContextValue {
  dsHolder: DisplayStrategyHolder
  setDsHolder: Dispatch<SetStateAction<DisplayStrategyHolder>>
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
      const descriptionValues = Object.values(plugin.description).map(desc => desc.toLowerCase())
      const matchesDescription = descriptionValues.some(desc => desc.toLowerCase().includes(kw.toLowerCase()))
      if (!isSubsequence(kw, id) && !isSubsequence(kw, name) && !matchesDescription) {
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
      const set = new Set(plugin.labels);
      if (!ds.selectedLabels.every(item => set.has(item))) {
        return false
      }
    }
    return true
  })
}
