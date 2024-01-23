import { SimplePlugin } from "@/catalogue/simple-types";
import { Link as NaLink } from "@/common/navigation";
import CommonCard from "@/components/common-card";
import { GfmMarkdownDynamic } from "@/components/gfm-markdown-dynamic";
import { GithubIcon } from "@/components/icons";
import { PluginAuthorList } from "@/components/plugin/plugin-author";
import { PluginDownloadButton } from "@/components/plugin/plugin-download-button";
import { PluginLabel } from "@/components/plugin/plugin-label";
import { TimeAgoDynamic } from "@/components/time-ago-dynamic";
import { translateLangDict } from "@/utils/i18n-utils"
import { ActionIcon, Tooltip } from "@mantine/core";
import { IconDownloadOff, IconFileDownload, IconRefresh, IconReload } from "@tabler/icons-react";
import { clsx } from "clsx";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import React from 'react';

function PluginCardDownloadButtonDisabled() {
  return (
    <ActionIcon disabled title="No release" aria-label="Download not available">
      <IconDownloadOff stroke={1.5}/>
    </ActionIcon>
  )
}

function PluginCardPluginLink({pluginId, pluginName}: {pluginId: string, pluginName: string}) {
  return (
    <NaLink
      href={`/plugins/p/${pluginId}`}
      className="text-2xl font-bold text-foreground break-words hover:text-mantine-primary-7 mx-1"
    >
      {pluginName}
    </NaLink>
  )
}

function PluginCardDescription({description}: {description: string}) {
  return (
    <GfmMarkdownDynamic dgmVariant="tiny">{description}</GfmMarkdownDynamic>
  )
}

function SmallStats({Icon, text, tooltip, fullToolTip}: { Icon: typeof IconRefresh, text: React.ReactNode, tooltip: React.ReactNode, fullToolTip: boolean }) {
  const clazz: string = "flex flex-row gap-0.5 items-center text-sm cursor-default"
  const icon = <Icon size="1rem" stroke={1.8}/>
  if (fullToolTip) {
    return (
      <Tooltip label={tooltip}>
        <div className={clazz}>
          {icon}
          {text}
        </div>
      </Tooltip>
    )
  } else {
    return (
      <div className={clazz}>
        <Tooltip label={tooltip}>
          {icon}
        </Tooltip>
        {text}
      </div>
    )
  }
}

export function PluginCard({plugin}: {plugin: SimplePlugin}) {
  const release = plugin.latestRelease

  const locale = useLocale()
  const t = useTranslations('page.plugin_list.plugin_card')

  const repositoryButton =
    <ActionIcon color="gray.7" aria-label={`Visit GitHub repository for ${plugin.id}`}>
      <Link href={plugin.repos} aria-label={`GitHub repository for ${plugin.id}`}>
        <GithubIcon/>
      </Link>
    </ActionIcon>

  const downloadButton = release !== undefined ?
    <PluginDownloadButton release={release}/>:
    <PluginCardDownloadButtonDisabled/>

  const lastUpdateText = plugin.recentUpdated !== undefined
    ? <TimeAgoDynamic date={plugin.recentUpdated}/>
    : <p>N/A</p>
  return (
    <CommonCard className="flex flex-col">
      <div className="flex items-baseline justify-between mb-2 flex-col sm:flex-row">
        <PluginCardPluginLink pluginId={plugin.id} pluginName={plugin.name}/>

        <div className="flex items-baseline">
          <p className={clsx("text-mantine-gray-text text-sm mr-1")}>by</p>
          <PluginAuthorList authors={plugin.authors} textClassName="text-sm"/>
        </div>
      </div>

      <div className="grow w-full">
        <div className="col-span-5 flex flex-col justify-between">
          <div className="mb-3 ml-1 min-h-[25px]">
            <PluginCardDescription description={translateLangDict(locale, plugin.description, true) || ''}/>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5 items-center self-end">
              {plugin.labels.map((label, index) =>
                <PluginLabel key={index} label={label}/>
              )}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <div className="flex flex-row gap-3 self-end">
                <SmallStats Icon={IconReload} text={lastUpdateText} tooltip={t('last_update')} fullToolTip={false}/>
                <SmallStats Icon={IconFileDownload} text={<p>{plugin.downloads}</p>} tooltip={t('total_downloads')} fullToolTip={true}/>
              </div>
              <div className="flex gap-2">
                {repositoryButton}
                {downloadButton}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CommonCard>
  )
}
