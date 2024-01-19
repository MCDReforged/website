import { clsx } from "clsx";
import React from "react";

export const tabs = [
  'introduction',
  'releases',
  'dependencies',
]

export function TabBody({children, className, ...props}: {children: React.ReactNode, className?: string, [_: string]: any}) {
  return (
    <div className={clsx(className, "mt-3 mx-2")} {...props}>
      {children}
    </div>
  )
}
