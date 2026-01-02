import { SimplePlugin } from "@/catalogue/simple-types";
import { translateLangDict } from "@/utils/i18n-utils";
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

function isSubsequence(keyword: string, s: string): boolean {
  let idx = 0;
  for (let i = 0; i < s.length && idx < keyword.length; i++) {
    if (s[i] === keyword[idx]) {
      idx++;
    }
  }
  return idx === keyword.length;
}

function adaptiveFilter(items: SimplePlugin[], keyword: string, predicate: (item: SimplePlugin, kw: string, mode: 'substring' | 'subsequence') => boolean): SimplePlugin[] {
  const exactMatches = items.filter(item => predicate(item, keyword, 'substring'));
  if (exactMatches.length > 0) {
    return exactMatches;
  }
  return items.filter(item => predicate(item, keyword, 'subsequence'));
}

export function filterPlugins(plugins: SimplePlugin[], ds: DisplayStrategy, locale: string) {
  let result = plugins;

  if (ds.nameKeyword) {
    result = adaptiveFilter(result, ds.nameKeyword.toLowerCase(), (plugin, kw, mode) => {
      const id = plugin.id.toLowerCase();
      const name = plugin.name.toLowerCase();
      const description = (translateLangDict(locale, plugin.description) || '').toLowerCase();

      if (mode === 'substring') {
        return id.includes(kw) || name.includes(kw) || description.includes(kw);
      } else {
        return isSubsequence(kw, id) || isSubsequence(kw, name) || description.includes(kw);
      }
    });
  }

  if (ds.authorKeyword) {
    result = adaptiveFilter(result, ds.authorKeyword.toLowerCase(), (plugin, kw, mode) => {
      return plugin.authors.some(author => {
        const authorName = author.name.toLowerCase();
        return mode === 'substring' ? authorName.includes(kw) : isSubsequence(kw, authorName);
      });
    });
  }

  if (ds.selectedLabels.length > 0) {
    result = result.filter(plugin => {
      const pluginLabels = new Set(plugin.labels);
      return ds.selectedLabels.every(label => pluginLabels.has(label));
    });
  }

  return result;
}
