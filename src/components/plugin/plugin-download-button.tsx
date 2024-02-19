import { SimpleRelease } from "@/catalogue/simple-types";
import { ClickableTooltip } from "@/components/clickable-tooltip";
import { ActionIcon } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { clsx } from "clsx";
import { useTranslations } from "next-intl";
import React from "react";

export function PluginDownloadButton({release, variant = 'filled'}: {release: SimpleRelease, variant?: string}) {
  const t = useTranslations('component.plugin_download_button')

  const tooltip = t('tooltip', {name: release.assetName, version: release.version})
  return (
    <ClickableTooltip label={tooltip}>
      <ActionIcon color="teal" variant={variant} aria-label={tooltip} className={clsx(variant === 'filled' && 'text-mantine-icon-white')}>
        <a href={release.assetUrl} aria-label={tooltip} download>
          <IconDownload stroke={1.5}/>
        </a>
      </ActionIcon>
    </ClickableTooltip>
  )
}
