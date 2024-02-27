import { Button } from "@mantine/core";
import React from "react";

export function DownloadSectionButton({children, ...rest}: {children: React.ReactNode, [_: string]: any}) {
  return (
    <Button
      classNames={{
        root: 'w-full min-[800px]:w-[170px]',
        label: 'text-sm font-medium',
      }}
      variant="filled"
      {...rest}
    >
      {children}
    </Button>
  )
}
