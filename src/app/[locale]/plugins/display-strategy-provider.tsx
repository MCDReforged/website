'use client'

import { createContext, useState } from "react";
import { DisplayStrategy, DisplayStrategyContextValue } from "./display-strategy";

const defaultDisplayStrategy: DisplayStrategy = {
  page: null,
  keyword: '',
  selectedLabels: [],
  sortOrder: null,
  sortReversed: false,
}

export const DisplayStrategyContext = createContext<DisplayStrategyContextValue>({
  ds: defaultDisplayStrategy,
  setDs: _ => {},
})

export function DisplayStrategyContextProvider({ children }: {children: React.ReactNode}) {
  const [ds, setDs] = useState<DisplayStrategy>(defaultDisplayStrategy)
  return (
    <DisplayStrategyContext.Provider value={{ds, setDs}}>
      {children}
    </DisplayStrategyContext.Provider>
  )
}
