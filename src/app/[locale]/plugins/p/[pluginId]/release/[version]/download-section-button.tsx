import { Button } from "@mantine/core";
import React from "react";

export function DownloadSectionButton({children, ...rest}: {children: React.ReactNode, [_: string]: any}) {
  return (
    <Button
      classNames={{label: 'text-sm font-medium'}}
      w={170}
      variant="filled"
      size="xs"
      {...rest}
    >
      {children}
    </Button>
  )
}
