'use client'

import { ClickableTooltip } from "@/components/clickable-tooltip";
import { formatTime } from "@/utils/time-utils";
import { useLocale } from "next-intl";
import React, { useEffect, useState } from "react";

interface TimeTexts {
  text: string
  hover?: string
}

function createTimeTexts(date: Date, format: string, hoverFormat: string | undefined, locale: string, utc: boolean): TimeTexts {
  return {
    text: formatTime(date, format, locale, utc),
    hover: hoverFormat ? formatTime(date, hoverFormat, locale, utc) : undefined,
  }
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

  const [texts, setTexts] = useState<TimeTexts>(
    createTimeTexts(date, format, hoverFormat, locale, true)
  )

  // rebuild texts on client
  useEffect(
    () => setTexts(createTimeTexts(date, format, hoverFormat, locale, false)),
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
