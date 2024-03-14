'use client'

import { ActionIcon, CopyButton, CopyButtonProps, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

export type HashCopyButtonProps = Omit<CopyButtonProps, 'children'> & {
  iconSize?: number
}

export function HashCopyButton(props: HashCopyButtonProps) {
  const t = useTranslations('page.plugin.release')
  const iconSize = props.iconSize ?? 14
  return (
    <CopyButton {...props}>
      {({copied, copy}) => {
        const Icon = copied ? IconCheck : IconCopy
        return (
          <Tooltip
            label={t( copied ? 'copied_hash' : 'copy_hash')}
            position="right"
            openDelay={copied ? undefined : 500}
          >
            <ActionIcon
              variant={copied ? 'transparent' : 'subtle'}
              color="gray"
              onClick={copy}
              size="sm"
            >
              <Icon size={iconSize} color={copied ? 'green' : undefined}/>
            </ActionIcon>
          </Tooltip>
        )
      }}
    </CopyButton>
  )
}
