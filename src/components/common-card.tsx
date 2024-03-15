import { Card } from "@mantine/core";
import { clsx } from "clsx";
import React from "react";

export default function CommonCard({children, className, ...props}: {children: React.ReactNode, className?: string, [_: string]: any}) {
  return (
    <Card
      className={clsx('bg-mantine-background', className)}
      shadow="none"
      radius="md"
      withBorder
      {...props}
    >
      {children}
    </Card>
  )
}
