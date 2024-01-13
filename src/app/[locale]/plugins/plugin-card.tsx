import MyCard from "@/components/ui/my-card";
import { PluginLabel } from "@/components/ui/plugin-label";
import { getAuthors } from "@/data/utils";
import { AllOfAPlugin, ReleaseInfo } from "@/types/plugin-catalogue-meta";
import { ActionIcon, Text } from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";
import Link from "next/link";
import React from 'react';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PluginCardDownloadButton, PluginCardDownloadButtonDisabled } from "./plugin-card-download-button";
import { PluginCardPluginLink } from "./plugin-card-plugin-link";

const authorSummary = getAuthors()

function PluginAuthor({author}: {author: string}) {
  const authors = authorSummary.authors
  return (
    <Link href={authors[author].link} className="text-foreground text-sm mx-1 hover:text-primary">
      {author}
    </Link>
  )
}

function removeGitHubPrefix(url: string): string {
  if (url.endsWith('/')) {
    url = url.slice(0, url.length - 1)
  }
  const prefix = "https://github.com/";
  return url.startsWith(prefix) ? url.slice(prefix.length) : url;
}

export function PluginCard({plugin}: {plugin: AllOfAPlugin}) {
  const authorCount = plugin.plugin.authors.length
  const release: ReleaseInfo | undefined = plugin.release.releases[plugin.release.latest_version_index]  // latest one
  const reposPair = removeGitHubPrefix(plugin.plugin.repository)

  const repositoryButton =
    <ActionIcon className="mx-2" color="#404040">
      <Link href={plugin.plugin.repository}>
        <IconBrandGithub stroke={1.5}/>
      </Link>
    </ActionIcon>

  const downloadButton = release !== undefined ?
    <PluginCardDownloadButton release={release}/>:
    <PluginCardDownloadButtonDisabled />

  return (
    <MyCard>
      <div className="flex items-baseline justify-between mb-2">
        <PluginCardPluginLink plugin={plugin} />

        <div className="flex items-baseline">
          <Text size="sm" c="gray">by</Text>
          {plugin.plugin.authors.map((author, index) =>
            <React.Fragment key={index}>
              <PluginAuthor author={author}/>
              <p>{index < authorCount - 1 && ','}</p>
            </React.Fragment>
          )}
        </div>
      </div>

      <div className="grid justify-between grid-cols-6">
        <div className="col-span-5">
          <Markdown className="mb-3 ml-1" remarkPlugins={[remarkGfm]}>
            {plugin.meta.description['en_us']}
          </Markdown>
          <div className="flex gap-1.5">
            {plugin.plugin.labels.map((label, index) =>
              <PluginLabel key={index} label={label}/>
            )}
          </div>
        </div>

        <div className="col-span-1 place-self-end flex">
          {repositoryButton}
          {downloadButton}
        </div>
      </div>
    </MyCard>
  )
}
