'use client'

import { useRouter } from "@/common/navigation";
import { Box } from "@mantine/core";
import { clsx } from "clsx";
import React from "react";

interface ReleaseRowProps {
  className?: string
  children: React.ReactNode
  href: string
}

export function ReleaseRow({className, children, href}: ReleaseRowProps) {
  const router = useRouter()

  return (
    <Box
      className={clsx(
        className,
        "w-full px-3",
        "py-2 rounded-lg",
        "cursor-pointer hover:bg-mantine-gray-hover-background",
      )}
      onClick={() => router.push(href)}
    >
      {children}
    </Box>
  )
}
