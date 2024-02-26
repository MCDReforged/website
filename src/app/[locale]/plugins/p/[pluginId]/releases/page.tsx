import { getPluginOr404 } from "@/catalogue/data";
import { AllOfAPlugin } from "@/catalogue/meta-types";
import { ClickableTooltip } from "@/components/clickable-tooltip";
import { NaLink } from "@/components/na-link";
import { routes } from "@/config/routes";
import { formatTime } from "@/utils/time-utils";
import { prettySize } from "@/utils/unit-utils";
import { ActionIcon, ScrollArea } from "@mantine/core";
import { Icon, IconCalendar, IconDownload, IconFileDownload, IconInfoCircle, IconTag, IconWeight } from "@tabler/icons-react";
import { clsx } from "clsx";
import { getLocale, getTranslations, unstable_setRequestLocale } from "next-intl/server";
import React from "react";
import { ReleaseRows, TitleRow } from "./release-rows";

interface IconTextProps {
  className?: string
  icon: Icon
  iconSize?: number
  iconStroke?: number
  children: React.ReactNode
}

async function IconText(props: IconTextProps) {
  return (
    <div className={clsx(props.className, 'flex flex-row gap-1 items-center')}>
      <props.icon size={props.iconSize || 18} stroke={props.iconStroke || 1.6}/>
      {props.children}
    </div>
  )
}

async function TitleText(props: Omit<IconTextProps, 'iconSize' | 'iconStroke'>) {
  return (
    <IconText icon={props.icon} iconSize={18} iconStroke={2}>
      <p className="font-bold">
        {props.children}
      </p>
    </IconText>
  )
}

async function PluginContentReleases({plugin}: {plugin: AllOfAPlugin}) {
  const t = await getTranslations('page.plugin.releases')
  const locale = await getLocale()

  return (
    <ScrollArea scrollbars="x" className="w-full">
      <div className="flex flex-col min-w-[400px]">
        <TitleRow>
          <p/>
          <TitleText icon={IconTag}>{t('release')}</TitleText>
          <TitleText icon={IconInfoCircle}>{t('information')}</TitleText>
        </TitleRow>

        {
          plugin.release.releases.map((ri) => {
            const version = ri.meta.version
            const date = new Date(ri.asset.created_at)
            const href = routes.pluginRelease(plugin.meta.id, version)
            return (
              <ReleaseRows key={version} href={href}>
                <div className="place-self-center">
                  <ActionIcon
                    color="teal"
                    component="a"
                    href={ri.asset.browser_download_url}  // TODO: gh proxy
                    download
                  >
                    <IconDownload stroke={1.6}/>
                  </ActionIcon>
                </div>

                <NaLink href={href}>
                  <p className="break-all font-bold">{ri.asset.name}</p>
                  <p className="break-all">v{version}</p>
                </NaLink>

                <NaLink href={href}>
                  <IconText icon={IconCalendar}>
                    <ClickableTooltip label={formatTime(date, 'LLL', locale)} openDelay={500}>
                      <p>{formatTime(date, 'LL', locale)}</p>
                    </ClickableTooltip>
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
              </ReleaseRows>
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
