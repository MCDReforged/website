'use client'

import { formatTime, getTimeAgo } from "@/utils/time-utils";
import { Tooltip } from "@mantine/core";
import { useLocale } from "next-intl";
import React, { Component, useEffect, useState } from "react";

interface TimeTexts {
  timeAgo: string
  timeFormatted: string
}

function createTimeTexts(date: Date, locale: string): TimeTexts {
  return {
    timeAgo: getTimeAgo(date, locale),
    timeFormatted: formatTime(date, 'LLL', locale),
  }
}

export function TimeAgo({date, className, component: Component = 'p'}: { date: Date, className?: string, component?: React.ElementType }) {
  const locale = useLocale()
  const [timeTexts, setTimeTexts] = useState<TimeTexts>(createTimeTexts(date, locale))

  useEffect(() => {
    const interval = setInterval(
      () => {
        const newTexts = createTimeTexts(date, locale)
        if (newTexts.timeAgo !== timeTexts.timeAgo || newTexts.timeFormatted !== timeTexts.timeFormatted) {
          setTimeTexts(newTexts)
        }
      },
      60 * 1000,
    )
    return () => clearInterval(interval)
  }, [date, locale, timeTexts])

  return (
    <Tooltip label={timeTexts.timeFormatted}>
      <Component className={className}>{timeTexts.timeAgo}</Component>
    </Tooltip>
  )
}
