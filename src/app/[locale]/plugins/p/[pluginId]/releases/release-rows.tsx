'use client'

import { useRouter } from "@/common/navigation";
import { Box } from "@mantine/core";
import { clsx } from "clsx";
import React from "react";

interface RowProps {
  className?: string
  children: React.ReactNode
  href?: string
}

interface CommonRowProps {
  className?: string
  children: React.ReactNode
}

interface ReleaseRowProps {
  className?: string
  children: React.ReactNode
  href: string
}

function CommonRow({className, children, href}: RowProps) {
  const router = useRouter()
  const onClick = () => {
    if (href) {
      router.push(href)
    }
  }

  return (
    <Box
      className={clsx(
        className,
        "px-3",
        "w-full grid grid-cols-[40px_5fr_3fr] items-center gap-2",
      )}
      onClick={href ? onClick : undefined}
    >
      {children}
    </Box>
  )
}

export function TitleRow({className, children}: CommonRowProps) {
  return (
    <CommonRow className={clsx(
      className,
      "pb-1.5 mb-0.5 border-b border-solid",
    )}>
      {children}
    </CommonRow>
  )
}

export function ReleaseRows({className, children, href}: ReleaseRowProps) {
  return (
    <CommonRow className={clsx(
      className,
      "py-2 rounded-lg",
      "cursor-pointer hover:bg-mantine-gray-hover-background",
    )}>
      {children}
    </CommonRow>
  )
}
