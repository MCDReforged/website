'use client'

import React, { createContext, useState } from "react";
import { DisplayStrategyContextValue, DisplayStrategyHolder } from "./display-strategy";

const defaultDisplayStrategy: DisplayStrategyHolder = {
  value: {
    page: null,
    nameKeyword: '',
    authorKeyword: '',
    selectedLabels: [],
    sortOrder: null,
    sortReversed: false,
  }
}

export const DisplayStrategyContext = createContext<DisplayStrategyContextValue>({
  dsHolder: defaultDisplayStrategy,
  setDsHolder: _ => {},
})

export function DisplayStrategyContextProvider({ children }: {children: React.ReactNode}) {
  const [dsHolder, setDsHolder] = useState<DisplayStrategyHolder>(defaultDisplayStrategy)
  return (
    <DisplayStrategyContext.Provider value={{dsHolder, setDsHolder}}>
      {children}
    </DisplayStrategyContext.Provider>
  )
}
