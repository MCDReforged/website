'use client'

import { useGithubProxyUrl } from "@/hooks/use-github-proxy-state";
import { IconDownload, IconRocket } from "@tabler/icons-react";
import React from "react";
import { DownloadSectionButton } from "./download-section-button";

export function ProxyableDownloadButton({rawUrl, children}: {rawUrl: string, children: React.ReactNode}) {
  const {url, proxied} = useGithubProxyUrl(rawUrl)

  return (
    <DownloadSectionButton
      leftSection={<IconDownload size={20} stroke={1.6}/>}
      color="teal"
      component="a"
      href={url}
      download
    >
      <div className="flex items-center">
        {children}
        {proxied && <IconRocket className="absolute bottom-0 right-0" size={13} stroke={1.5}/>}
      </div>
    </DownloadSectionButton>
  )
}
