'use client'

import { useRouter } from "@/common/navigation";
import { TableTr } from "@mantine/core";
import React from "react";

export function LinkTableRow({href, children}: {href: string, children: React.ReactNode}) {
  const router = useRouter()

  return (
    <TableTr
      onClick={() => router.push(href)}
    >
      {children}
    </TableTr>
  )
}
