'use client'

import { ClickableTooltip } from "@/components/clickable-tooltip";
import { useGithubProxyUrl } from "@/hooks/use-github-proxy-state";
import { ActionIcon } from "@mantine/core";
import { IconDownload, IconRocket } from "@tabler/icons-react";
import React from "react";

export function AssetDownloadButton({className, href, tooltip}: { className: string, href: string, tooltip: string }) {
  const {url, proxied} = useGithubProxyUrl(href)

  return (
    <ClickableTooltip
      className={className}
      label={tooltip}
      openDelay={500}
      offset={12}
      onClick={(event: MouseEvent) => event.stopPropagation()}
    >
      <ActionIcon
        color="teal"
        size={36}
        component="a"
        href={url}
        download
      >
        <IconDownload stroke={1.6}/>
        {proxied && <IconRocket
          className="absolute bottom-0 right-0"
          size={11}
          stroke={1.5}
        />}
      </ActionIcon>
    </ClickableTooltip>
  )
}
