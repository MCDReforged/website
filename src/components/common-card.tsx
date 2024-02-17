import { Card } from "@mantine/core";
import React from "react";

export default function CommonCard({children, ...props}: {children: React.ReactNode, [_: string]: any}) {
  return (
    <Card shadow="none" radius="md" withBorder {...props}>
      {children}
    </Card>
  )
}
