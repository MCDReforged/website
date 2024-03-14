'use client'

import { Tooltip, TooltipProps, useDelayedHover } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React from "react";

export function ClickableTooltip({children, openDelay, closeDelay, ...rest}: TooltipProps) {
  const [opened, {open, close}] = useDisclosure(false);

  // should use floating-ui instead for a proper usage, but why not just reuse mantine's
  // see also https://github.com/orgs/mantinedev/discussions/2499
  const opener = useDelayedHover({ open, close, openDelay, closeDelay })

  return (
    <Tooltip
      {...rest}
      opened={opened}
      onMouseEnter={opener.openDropdown}
      onMouseLeave={opener.closeDropdown}
    >
      {children}
    </Tooltip>
  )
}
