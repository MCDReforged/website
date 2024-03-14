import { Button } from "@mantine/core";
import { clsx } from "clsx";
import React from "react";

export function DownloadSectionButton({children, className, ...rest}: {children: React.ReactNode, className?: string, [_: string]: any}) {
  return (
    <Button
      classNames={{
        root: clsx('w-full min-[800px]:w-[170px]', className),
        label: 'text-sm font-medium',
      }}
      variant="filled"
      {...rest}
    >
      {children}
    </Button>
  )
}
