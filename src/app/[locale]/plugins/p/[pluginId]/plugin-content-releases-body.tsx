'use client'

import { ReleaseInfo } from "@/catalogue/meta-types";
import { DynamicGfmMarkdown } from "@/components/ui/dynamic-gfm-markdown";
import { ActionIcon, Modal, Title, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconFileDescription } from "@tabler/icons-react";
import React from "react";

export function PluginReleaseBodyButton({release}: {release: ReleaseInfo}) {
  const version = release.meta.version
  const tooltip = `Show release body for v${version}`
  const title = `Release body for v${version}`

  const [opened, { open, close }] = useDisclosure(false)
  return (
    <>
      <Tooltip label={tooltip}>
        <ActionIcon color="cyan" aria-label={tooltip} onClick={open}>
          <IconFileDescription stroke={1.5}/>
        </ActionIcon>
      </Tooltip>

      <Modal
        size="xl"
        opened={opened} onClose={close}
        title={<Title order={3}>{title}</Title>}
        closeButtonProps={{ 'aria-label': 'Close modal' }}
        removeScrollProps={{ removeScrollBar: false }}
      >
        <div className="pb-1 px-1">
          <DynamicGfmMarkdown>
            {release.description || ''}
          </DynamicGfmMarkdown>
        </div>
      </Modal>
    </>
  )
}
