'use client'

import { ClickableTooltip } from "@/components/clickable-tooltip";
import { NaLink } from "@/components/na-link";
import { ActionIcon, Modal, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconExternalLink, IconFileDescription } from "@tabler/icons-react";
import React from "react";

interface PluginReleaseBodyButtonProps {
  releaseUrl: string
  hasDescription: boolean
  texts: {
    tooltip: string
    title: string
    nothing: string
  }
  children: React.ReactNode
}

export function PluginReleaseBodyButton({releaseUrl, hasDescription, texts, children}: PluginReleaseBodyButtonProps) {
  const [modalOpened, modalOpener] = useDisclosure(false)

  if (!hasDescription) {
    const tooltip = texts.nothing
    return (
      <ClickableTooltip label={tooltip}>
        <ActionIcon color="blue" variant="light" aria-label={tooltip} disabled>
          <IconFileDescription stroke={1.5}/>
        </ActionIcon>
      </ClickableTooltip>
    )
  }

  const {tooltip, title} = texts
  return (
    <>
      <ClickableTooltip label={tooltip}>
        <ActionIcon color="blue" variant="light" aria-label={tooltip} onClick={modalOpener.open}>
          <IconFileDescription stroke={1.5}/>
        </ActionIcon>
      </ClickableTooltip>

      <Modal
        size="xl"
        opened={modalOpened} onClose={modalOpener.close}
        title={
          <div className="flex items-center">
            <Title order={3} className="mx-2">{title}</Title>
            <NaLink href={releaseUrl} aria-label={tooltip} hoverColor>
              <IconExternalLink stroke={1.5}/>
            </NaLink>
          </div>
        }
        closeButtonProps={{ 'aria-label': 'Close modal' }}
        zIndex={400 /* tooltip has zIndex==300, cover it */}
      >
        <div className="mb-2 mx-2">
          {children}
        </div>
      </Modal>
    </>
  )
}
