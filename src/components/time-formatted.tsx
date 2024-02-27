'use client'

import { ClickableTooltip } from "@/components/clickable-tooltip";
import { formatTime } from "@/utils/time-utils";
import { useLocale } from "next-intl";
import React, { useEffect, useState } from "react";

interface TimeTexts {
  text: string
  hover?: string
}

interface TimeFormattedProps {
  date: Date
  format: string,
  hoverFormat?: string
  hoverOpenDelay?: number
  className?: string
  component?: React.ElementType
}

export function TimeFormatted({date, format, hoverFormat, hoverOpenDelay, className, component: Component = 'p'}: TimeFormattedProps) {
  const locale = useLocale()

  function createTimeTexts(utc: boolean): TimeTexts {
    return {
      text: formatTime(date, format, locale, utc),
      hover: hoverFormat ? formatTime(date, hoverFormat, locale, utc) : undefined,
    }
  }

  const [texts, setTexts] = useState<TimeTexts>(createTimeTexts(true))

  // rebuild texts on client
  useEffect(
    () => setTexts(createTimeTexts(false)),
    [date, format, hoverFormat, locale]
  )

  const textElement = (
    <Component className={className}>
      {texts.text}
    </Component>
  )
  if (texts.hover !== undefined) {
    return (
      <ClickableTooltip label={texts.hover} openDelay={hoverOpenDelay}>
        {textElement}
      </ClickableTooltip>
    )
  } else {
    return textElement
  }
}
