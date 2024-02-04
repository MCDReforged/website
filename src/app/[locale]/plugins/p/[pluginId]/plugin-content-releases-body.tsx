'use client'

import { NaLink } from "@/components/na-link";
import { ActionIcon, Modal, Popover, Title, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconExternalLink, IconFileDescription } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import React from "react";

interface PluginReleaseBodyButtonProps {
  version: string
  releaseUrl: string
  hasDescription: boolean
  children: React.ReactNode
}

export function PluginReleaseBodyButton({version, releaseUrl, hasDescription, children}: PluginReleaseBodyButtonProps) {
  const t = useTranslations('page.plugin.releases')

  const [modalOpened, modalOpener] = useDisclosure(false)
  const [popoverOpened, popoverOpener] = useDisclosure(false)

  if (!hasDescription) {
    const tooltip = t('button_release_body_nothing', {version})
    return (
      <Tooltip label={tooltip}>
        <ActionIcon color="blue" variant="light" aria-label={tooltip} disabled>
          <IconFileDescription stroke={1.5}/>
        </ActionIcon>
      </Tooltip>
    )
  }

  const tooltip = t('button_release_body_tooltip', {version})
  const title = t('button_release_body_title', {version})
  return (
    <>
      <Popover opened={popoverOpened} position="left-start" width={300}>
        <Popover.Target>
          <Tooltip label={tooltip} onMouseEnter={popoverOpener.open} onMouseLeave={popoverOpener.close}>
            <ActionIcon color="blue" variant="light" aria-label={tooltip} onClick={modalOpener.open}>
              <IconFileDescription stroke={1.5}/>
            </ActionIcon>
          </Tooltip>
        </Popover.Target>

        <Popover.Dropdown className="shadow-lg border-mantine-border">
          <div className="line-clamp-3 max-h-[200px]">
            {children}
          </div>
        </Popover.Dropdown>
      </Popover>

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
      >
        <div className="mb-2 mx-2">
          {children}
        </div>
      </Modal>
    </>
  )
}
