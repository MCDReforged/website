'use client'

import { Tabs } from "@mantine/core";
import { useQueryState } from "nuqs";
import React, { Suspense, useEffect, useState } from "react";
import { tabKeys } from "./plugin-content-common";

const firstTab = tabKeys[0]

interface SearchParamsReader {
  setInitTabValue: (v: string) => void
  newTabValue?: string
}

// useSearchParams needs a Suspense wrapper for SSR,
// and here comes the wrapper component
function SearchParamsReader({setInitTabValue, newTabValue}: SearchParamsReader) {
  // https://github.com/vercel/next.js/discussions/48110#discussioncomment-7017549
  const [queryValue, setQueryValue] = useQueryState('tab')

  useEffect(() => {
    if (queryValue && tabKeys.includes(queryValue)) {
      setInitTabValue(queryValue)
    }
  }, [queryValue, setInitTabValue]);

  useEffect(() => {
    if (newTabValue !== undefined && newTabValue !== queryValue) {
      setQueryValue(newTabValue).catch(e => console.log('setQueryValue error', newTabValue, e))
    }
  }, [queryValue, setQueryValue, newTabValue])

  return <></>
}

export function PluginContentTabs({children, ...props}: {children: React.ReactNode, [key: string]: any}) {
  const [initTabValue, setInitTabValue] = useState<string | undefined>(firstTab)
  const [newTabValue, setNewTabValue] = useState<string | undefined>(undefined)

  return (
    <>
      <Suspense>
        <SearchParamsReader setInitTabValue={setInitTabValue} newTabValue={newTabValue}/>
      </Suspense>
      <Tabs
        value={newTabValue || initTabValue}
        defaultValue={initTabValue}
        onChange={(value) => {
          if (value !== null) {
            setNewTabValue(value)
          }
        }}
        {...props}
      >
        {children}
      </Tabs>
    </>
  )
}
