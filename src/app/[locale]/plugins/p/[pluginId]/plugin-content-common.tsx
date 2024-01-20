import { IconBook, IconPackageImport, IconTags } from "@tabler/icons-react";
import { clsx } from "clsx";
import React from "react";

interface TabConfig {
  key: string
  icon: typeof IconBook
}

export const tabConfig: TabConfig[] = [
  {
    key: 'introduction',
    icon: IconBook,
  },
  {
    key: 'releases',
    icon: IconTags,
  },
  {
    key: 'dependencies',
    icon: IconPackageImport,
  },
]
export const tabKeys: string[] = tabConfig.map(tc => tc.key)

export function TabBody({children, className, ...props}: {children: React.ReactNode, className?: string, [_: string]: any}) {
  return (
    <div className={clsx(className, "mt-3 mx-2")} {...props}>
      {children}
    </div>
  )
}
