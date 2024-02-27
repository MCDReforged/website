'use client'

import { Switch, Tooltip } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { IconDownload } from "@tabler/icons-react";
import React from "react";
import { DownloadSectionButton } from "./download-section-button";

interface ProxyableDownloadButtonProps {
  url: string
  texts: {
    download: string
    proxySwitch: string
    proxySwitchTooltip: string
  }
}

export function ProxyableDownloadButton({url, texts}: ProxyableDownloadButtonProps) {
  const [proxied, setProxied] = useLocalStorage<boolean>({
    key: 'mcdr-website-plugin-download-proxied',
    defaultValue: false,
  })
  if (proxied) {
    url = 'https://mirror.ghproxy.com/' + url
  }

  return (
    <>
      <DownloadSectionButton
        leftSection={<IconDownload size={20} stroke={1.6}/>}
        color="teal"
        component="a"
        href={url}
        download
      >
        {texts.download}
      </DownloadSectionButton>

      <div className="grow max-[800px]:hidden"/>

      <Switch
        classNames={{label: 'select-none'}}
        color="teal"
        label={
          <Tooltip label={texts.proxySwitchTooltip} openDelay={500}>
            <p>{texts.proxySwitch}</p>
          </Tooltip>
        }
        checked={proxied}
        onChange={(event) => setProxied(event.currentTarget.checked)}
      />
    </>
  )
}
