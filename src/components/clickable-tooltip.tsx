'use client'

import { Tooltip, useDelayedHover } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React from "react";

interface ClickableTooltipProps {
  children: React.ReactNode
  label: React.ReactNode
  openDelay?: number
  closeDelay?: number
  [_: string]: any
}

export function ClickableTooltip({children, openDelay, closeDelay, ...rest}: ClickableTooltipProps) {
  const [opened, {open, close}] = useDisclosure(false);

  // should use floating-ui instead for a proper usage, but why not just reuse mantine's
  // see also https://github.com/orgs/mantinedev/discussions/2499
  const opener = useDelayedHover({ open, close, openDelay, closeDelay })

  return (
    <Tooltip
      opened={opened}
      onMouseEnter={opener.openDropdown}
      onMouseLeave={opener.closeDropdown}
      {...rest}
    >
      {children}
    </Tooltip>
  )
}
