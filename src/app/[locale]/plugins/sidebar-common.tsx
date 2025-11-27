'use client'

import CommonCard from "@/components/common-card";
import { Button, ButtonVariant } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { clsx } from "clsx";
import { useTranslations } from "next-intl";
import React from "react";

export function SidebarCard({children, className}: {children: React.ReactNode, className?: string}) {
  return (
    <CommonCard className={clsx('p-5 overflow-hidden', className)}>
      <div className="flex flex-col gap-5">
        {children}
      </div>
    </CommonCard>
  )
}

export function CardSection({title, className, children}: {title: React.ReactNode, children: React.ReactNode, className?: string}) {
  return (
    <div className={clsx('flex flex-col', className)}>
      <p className="text-lg font-bold">{title}</p>
      {children}
    </div>
  )
}

interface ExpandButtonProps {
  className?: string
  buttonVariant: ButtonVariant
  isExpanded: boolean
  setIsExpanded: (isExpanded: boolean) => void
}

export function ExpandButton({className, buttonVariant, isExpanded, setIsExpanded}: ExpandButtonProps) {
  const t = useTranslations('page.plugin_list.sidebar')
  return (
    <div className={clsx(className, "flex items-center justify-center")}>
      <Button
        variant={buttonVariant}
        onClick={() => setIsExpanded(!isExpanded)}
        className="justify-center rounded-md w-24"
        leftSection={isExpanded ? <IconChevronUp size={18}/> : <IconChevronDown size={18}/>}
      >
        {t(isExpanded ?'collapse' : 'expand')}
      </Button>
    </div>
  )
}
