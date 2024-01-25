import { Icon, IconBook, IconFileDescription, IconPackageImport, IconTags } from "@tabler/icons-react";
import { clsx } from "clsx";
import React from "react";

interface TabConfig {
  key: string
  icon: Icon
}

export const tabConfig: TabConfig[] = [
  {
    key: 'introduction',
    icon: IconBook,
  },
  {
    key: 'readme',
    icon: IconFileDescription,
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
    <div className={clsx(className, "pt-3 pb-2 px-4")} {...props}>
      {children}
    </div>
  )
}
