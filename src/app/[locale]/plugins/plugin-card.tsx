import { AuthorInfo, AuthorSummary } from "@/catalogue/meta-types";
import { SimplePlugin } from "@/catalogue/simple-types";
import { Link as NaLink } from "@/common/navigation";
import { GithubIcon } from "@/components/icons";
import MyCard from "@/components/ui/my-card";
import { PluginDownloadButton } from "@/components/ui/plugin/plugin-download-button";
import { PluginLabel } from "@/components/ui/plugin/plugin-label";
import { translateLangDict } from "@/utils/i18n-utils"
import { formatTime, toTimeAgo } from "@/utils/time-utils";
import { ActionIcon, Text, Tooltip } from "@mantine/core";
import { IconDownload, IconFileDownload, IconRefresh } from "@tabler/icons-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import React from 'react';

function PluginAuthor({author}: {author: AuthorInfo | undefined}) {
  if (author === undefined) {
    return null
  }
  return (
    <Link href={author.link} className="text-foreground text-sm mx-1 hover:text-primary">
      {author.name}
    </Link>
  )
}

function PluginCardDownloadButtonDisabled() {
  return (
    <ActionIcon disabled title="No release" aria-label="Download not available">
      <IconDownload stroke={1.5}/>
    </ActionIcon>
  )
}

function PluginCardPluginLink({pluginId, pluginName}: {pluginId: string, pluginName: string}) {
  return (
    <NaLink
      href={`/plugins/p/${pluginId}`}
      className="text-2xl font-bold text-foreground break-words hover:text-primary ml-1 mr-5"
    >
      {pluginName}
    </NaLink>
  )
}

export function PluginCard({plugin, authors}: {plugin: SimplePlugin, authors: AuthorSummary}) {
  const authorCount = plugin.authors.length
  const release = plugin.latestRelease

  const repositoryButton =
    <ActionIcon color="gray.7" aria-label={`Visit GitHub repository for ${plugin.id}`}>
      <Link href={plugin.repos} aria-label={`GitHub repository for ${plugin.id}`}>
        <GithubIcon/>
      </Link>
    </ActionIcon>

  const downloadButton = release !== undefined ?
    <PluginDownloadButton release={release}/>:
    <PluginCardDownloadButtonDisabled/>

  function SmallStats({Icon, text, tooltip}: {Icon: typeof IconRefresh, text: any, tooltip: string}) {
    return (
      <Tooltip label={tooltip}>
        <div className="flex flex-row gap-0.5 items-center text-sm">
          <Icon size="1rem"/>
          <p className="cursor-default">{text}</p>
        </div>
      </Tooltip>
    )
  }

  return (
    <MyCard className="min-h-[8.3rem] flex flex-col">
      <div className="flex items-baseline justify-between mb-2 flex-col sm:flex-row">
        <PluginCardPluginLink pluginId={plugin.id} pluginName={plugin.name} />

        <div className="flex items-baseline">
          <Text size="sm" c="gray">by</Text>
          {plugin.authors.map((author, index) =>
            <React.Fragment key={index}>
              <PluginAuthor author={authors.authors[author]}/>
              <p>{index < authorCount - 1 && ','}</p>
            </React.Fragment>
          )}
        </div>
      </div>

      <div className="grow w-full">
        <div className="col-span-5 flex flex-col justify-between">
          <div className="mb-3 ml-1">
            {translateLangDict(useLocale(), plugin.description, true) || ''}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5 items-center self-end">
              {plugin.labels.map((label, index) =>
                <PluginLabel key={index} label={label}/>
              )}
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <div className="flex flex-row gap-3 self-end">
                <SmallStats Icon={IconRefresh} text={toTimeAgo(plugin.recentUpdated) || 'N/A'} tooltip={`Last update: ${formatTime(plugin.recentUpdated) || 'N/A'}`}/>
                <SmallStats Icon={IconFileDownload} text={plugin.downloads} tooltip="Total downloads"/>
              </div>
              <div className="flex gap-2">
                {repositoryButton}
                {downloadButton}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MyCard>
  )
}
