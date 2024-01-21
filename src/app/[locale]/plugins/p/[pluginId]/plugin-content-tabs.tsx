'use client'

import { usePathname, useRouter } from "@/common/navigation";
import { Tabs } from "@mantine/core";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter(false)

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && tabKeys.includes(tab)) {
      setInitTabValue(tab)
    }
  }, [searchParams, setInitTabValue]);

  useEffect(() => {
    if (newTabValue !== undefined && newTabValue !== searchParams.get('tab')) {
      const params = new URLSearchParams(Array.from(searchParams.entries()))
      params.set('tab', newTabValue)
      router.replace(`${pathname}?${params}`)
    }
  }, [searchParams, pathname, router, newTabValue])

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
        value={initTabValue}
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
