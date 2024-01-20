'use client'

import { usePathname, useRouter } from "@/common/navigation";
import { Tabs } from "@mantine/core";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import { tabs } from "./plugin-content-common";

const firstTab = tabs[0]

function ParamsConnectedPluginContentTabs({children, ...tabProps}: {children: React.ReactNode, [key: string]: any}) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter(false)

  let defaultTab = searchParams.get('tab') || firstTab
  if (!tabs.includes(defaultTab)) {
    defaultTab = firstTab
  }

  return (
    <Tabs
      defaultValue={defaultTab}
      onChange={(value) => {
        if (value !== null && value !== searchParams.get('tab')) {
          const params = new URLSearchParams(Array.from(searchParams.entries()))
          params.set('tab', value)
          router.replace(`${pathname}?${params}`)
        }
      }}
      {...tabProps}
    >
      {children}
    </Tabs>
  )
}

export function PluginContentTabs({children, ...tabProps}: {children: React.ReactNode, [key: string]: any}) {
  const suspenseFallback = (
    <Tabs defaultValue={firstTab} {...tabProps}>
      {children}
    </Tabs>
  )
  return (
    <>
      <Suspense fallback={suspenseFallback}>
        <ParamsConnectedPluginContentTabs {...tabProps}>
          {children}
        </ParamsConnectedPluginContentTabs>
      </Suspense>
    </>
  )
}
