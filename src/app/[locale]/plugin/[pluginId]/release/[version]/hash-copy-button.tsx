'use client'

import { ActionIcon, CopyButton, CopyButtonProps } from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";

type HashCopyButtonProps = Omit<CopyButtonProps, 'children'> & {
  iconSize?: number
}

export function HashCopyButton(props: HashCopyButtonProps) {
  const iconSize = props.iconSize ?? 14
  return (
    <CopyButton {...props}>
      {({copied, copy}) => (
        <ActionIcon color='gray' variant="transparent" onClick={copy} size="sm">
          {copied ? <IconCheck size={iconSize}/> : <IconCopy size={iconSize}/>}
        </ActionIcon>
      )}
    </CopyButton>
  )
}
