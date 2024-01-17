'use client'

import { AuthorInfo, AuthorSummary } from "@/catalogue/meta-types";
import { SimplePlugin, SimpleRelease } from "@/catalogue/simple-types";
import { Link as NaLink } from "@/common/navigation";
import MyCard from "@/components/ui/my-card";
import { PluginLabel } from "@/components/ui/plugin-label";
import { translateLangDict } from "@/utils/i18n-utils"
import { ActionIcon, Text, Tooltip } from "@mantine/core";
import { IconBrandGithub, IconDownload } from "@tabler/icons-react";
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

function PluginCardDownloadButton({release}: {release: SimpleRelease}) {
  const version = release.version
  const tooltip = `${release.assetName} (v${version})`
  return (
    <Tooltip label={tooltip} offset={4} openDelay={500}>
      <ActionIcon color="teal" aria-label={`Download version ${version}`}>
        <a href={release.assetUrl} aria-label={`Download version ${version}`} download>
          <IconDownload stroke={1.5}/>
        </a>
      </ActionIcon>
    </Tooltip>
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
    <ActionIcon color="#404040" aria-label={`Visit GitHub repository for ${plugin.id}`}>
      <Link href={plugin.repository} aria-label={`GitHub repository for ${plugin.id}`}>
        <IconBrandGithub stroke={1.5}/>
      </Link>
    </ActionIcon>

  const downloadButton = release !== undefined ?
    <PluginCardDownloadButton release={release}/>:
    <PluginCardDownloadButtonDisabled/>

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

      <div className="flex flex-col sm:flex-row justify-between grow">
        <div className="col-span-5 flex flex-col justify-between">
          <div className="mb-3 ml-1">
            {translateLangDict(useLocale(), plugin.description, true) || ''}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5 items-center">
              {plugin.labels.map((label, index) =>
                <PluginLabel key={index} label={label}/>
              )}
            </div>
            <div className="sm:hidden flex flex-wrap gap-2">
              {repositoryButton}
              {downloadButton}
            </div>
          </div>
        </div>

        <div className="hidden sm:flex place-self-end flex-wrap gap-2">
          {repositoryButton}
          {downloadButton}
        </div>
      </div>
    </MyCard>
  )
}
