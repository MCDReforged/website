'use client'

import { formatTime, getTimeAgo } from "@/utils/time-utils";
import { Tooltip } from "@mantine/core";
import { useLocale } from "next-intl";
import React, { Component } from "react";

export function TimeAgo({date, className, component: Component = 'p'}: { date: Date, className?: string, component?: React.ElementType }) {
  const locale = useLocale()

  const timeAgo = getTimeAgo(date, locale)
  const timeFormatted = formatTime(date, 'LLL', locale)

  return (
    <Tooltip label={timeFormatted}>
      <Component className={className}>{timeAgo}</Component>
    </Tooltip>
  )
}
