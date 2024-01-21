'use client'

import { usePathname, useRouter } from "@/common/navigation";
import { Skeleton, Tabs } from "@mantine/core";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import { tabKeys } from "./plugin-content-common";

const firstTab = tabKeys[0]

function ParamsConnectedPluginContentTabs({children, ...tabProps}: {children: React.ReactNode, [_: string]: any}) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter(false)

  let defaultTab = searchParams.get('tab') || firstTab
  if (!tabKeys.includes(defaultTab)) {
    defaultTab = firstTab
  }

  return (
    <Tabs
      defaultValue={defaultTab}
      onChange={(value) => {
        if (value !== null && value !== searchParams.get('tab')) {
          const params = new URLSearchParams(Array.from(searchParams.entries()))
          params.set('tab', value)
          router.replace(`${pathname}?${params}`, {scroll: false})
        }
      }}
      {...tabProps}
    >
      {children}
    </Tabs>
  )
}

export function PluginContentTabs({children, ...tabProps}: {children: React.ReactNode, [_: string]: any}) {
  const suspenseFallback = (
    <div className="flex flex-col gap-3 pt-2">
      <p>DEBUG: Loading PluginContentTabs</p>
      <Skeleton height="0.8rem"/>
      <Skeleton height="0.8rem" width="50%"/>
      <Skeleton height="0.8rem" width="70%"/>
    </div>
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
