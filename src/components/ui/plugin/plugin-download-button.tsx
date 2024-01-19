import { createSimpleRelease } from "@/catalogue/conversion";
import { ReleaseInfo } from "@/catalogue/meta-types";
import { SimpleRelease } from "@/catalogue/simple-types";
import { ActionIcon, Tooltip } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import React from "react";

export function PluginDownloadButton({release}: {release: SimpleRelease | ReleaseInfo}) {
  if ('asset' in release) {
    release = createSimpleRelease(release)
  }
  const ariaLabel = `Download version ${release.version}`
  const tooltip = `${release.assetName} (v${release.version})`
  return (
    <Tooltip label={tooltip}>
      <ActionIcon color="teal" aria-label={ariaLabel}>
        <a href={release.assetUrl} aria-label={ariaLabel} download>
          <IconDownload stroke={1.5}/>
        </a>
      </ActionIcon>
    </Tooltip>
  )
}
