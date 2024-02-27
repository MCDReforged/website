import { getPluginOr404 } from "@/catalogue/data";
import { AllOfAPlugin } from "@/catalogue/meta-types";
import { NaLink } from "@/components/na-link";
import { TimeFormatted } from "@/components/time-formatted";
import { routes } from "@/config/routes";
import { prettySize } from "@/utils/unit-utils";
import { ActionIcon, ScrollArea } from "@mantine/core";
import { Icon, IconCalendar, IconDownload, IconFileDownload, IconTag, IconWeight } from "@tabler/icons-react";
import { clsx } from "clsx";
import { getLocale, unstable_setRequestLocale } from "next-intl/server";
import React from "react";
import { ReleaseRow } from "./release-row";

interface IconTextProps {
  className?: string
  icon: Icon
  size?: 'sm' | 'md'
  children: React.ReactNode
}

async function IconText(props: IconTextProps) {
  const { size = 'sm' } = props
  const isSmall = size === 'sm'

  return (
    <div className={clsx(
      props.className,
      'flex flex-row gap-0.5 items-center',
      isSmall && 'text-sm',
    )}>
      <props.icon size={isSmall ? 16 : 18} stroke={1.5}/>
      {props.children}
    </div>
  )
}

async function PluginContentReleases({plugin}: {plugin: AllOfAPlugin}) {
  const locale = await getLocale()

  return (
    <ScrollArea scrollbars="x" className="w-full">
      <div className="flex flex-col min-w-[350px]">
        {
          plugin.release.releases.map((ri) => {
            const version = ri.meta.version
            const date = new Date(ri.asset.created_at)
            const href = routes.pluginRelease(plugin.meta.id, version)
            return (
              <ReleaseRow key={version} href={href}>
                <div className="flex flex-row items-center gap-4">
                  <ActionIcon
                    color="teal"
                    size="lg"
                    component="a"
                    href={ri.asset.browser_download_url}  // TODO: gh proxy
                    download
                  >
                    <IconDownload stroke={1.6}/>
                  </ActionIcon>

                  <div className={clsx(
                    "grow",
                    "max-lg:flex max-lg:flex-col",
                    "lg:grid lg:grid-cols-[5fr_3fr] lg:items-center",
                    "gap-x-2 gap-y-1",
                  )}>
                    <NaLink href={href}>
                      <p className="font-bold">{ri.asset.name}</p>
                      <IconText icon={IconTag} size="md">
                        <p>{version}</p>
                      </IconText>
                    </NaLink>

                    <NaLink href={href} className="flex flex-row lg:flex-col gap-x-3 gap-y-0.5">
                      <IconText icon={IconCalendar}>
                        <TimeFormatted date={date} format="LL" hoverFormat="LLL" hoverOpenDelay={500}/>
                      </IconText>
                      <div className="flex gap-3">
                        <IconText icon={IconWeight}>
                          <p>{prettySize(ri.asset.size, 0)}</p>
                        </IconText>
                        <IconText icon={IconFileDownload}>
                          <p>{ri.asset.download_count}</p>
                        </IconText>
                      </div>
                    </NaLink>
                  </div>
                </div>
              </ReleaseRow>
            )
          })
        }
      </div>
    </ScrollArea>
  )
}

export default async function Page({params: {pluginId, locale}}: { params: { pluginId: string, locale: string } }) {
  unstable_setRequestLocale(locale);
  const plugin = await getPluginOr404(pluginId)

  return (
    <div>
      <PluginContentReleases plugin={plugin}/>
    </div>
  )
}
