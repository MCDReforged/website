'use client'

import { ActionIcon, CopyButton, CopyButtonProps, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";

export type CommonCopyButtonProps = Omit<CopyButtonProps, 'children'> & {
  iconSize?: number  // default 14
  labelCopy: string  // before copy click
  labelCopied: string  // after copy click
}

export function CommonCopyButton(props: CommonCopyButtonProps) {
  const iconSize = props.iconSize ?? 14
  return (
    <CopyButton {...props}>
      {({copied, copy}) => {
        const Icon = copied ? IconCheck : IconCopy
        return (
          <Tooltip
            label={copied ? props.labelCopied : props.labelCopy}
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
