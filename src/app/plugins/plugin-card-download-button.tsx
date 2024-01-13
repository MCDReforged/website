import { ReleaseInfo } from "@/types/plugin-catalogue-meta";
import { ActionIcon, Tooltip } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import React from "react";

export function PluginCardDownloadButtonDisabled() {
  return (
    <ActionIcon disabled title="No release">
      <IconDownload stroke={1.5}/>
    </ActionIcon>
  )
}

export function PluginCardDownloadButton({release}: {release: ReleaseInfo}) {
  const tooltip = `${release.asset.name} (v${release.meta.version})`
  return (
    <Tooltip label={tooltip} offset={4} openDelay={500}>
      <ActionIcon color="teal">
        <a href={release.asset.browser_download_url} download>
          <IconDownload stroke={1.5}/>
        </a>
      </ActionIcon>
    </Tooltip>
  )
}
