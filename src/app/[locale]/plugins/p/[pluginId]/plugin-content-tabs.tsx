'use client'

import { usePathname, useRouter } from "@/common/navigation";
import { Tabs } from "@mantine/core";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { tabs } from "./plugin-content-common";

interface SearchParamsReader {
  setInitTabValue: (v: string) => void
  newTabValue?: string
}

function SearchParamsReader({setInitTabValue, newTabValue}: SearchParamsReader) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (searchParams.has('tab')) {
      setInitTabValue(searchParams.get('tab')!)
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
  const [initTabValue, setInitTabValue] = useState<string | undefined>(tabs[0])
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
