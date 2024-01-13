import React from 'react';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { AllOfAPlugin } from "@/types/plugin-catalogue-meta";
import { PluginLabel } from "@/components/plugins/label";
import { getAuthors } from "@/data/utils";
import Link from "next/link";
import MyCard from "@/components/ui/my-card";
import { ActionIcon } from "@mantine/core";
import { IconBrandGithub, IconDownload } from "@tabler/icons-react";

const authorSummary = getAuthors()

function PluginAuthor({author}: {author: string}) {
  const authors = authorSummary.authors
  return (
    <Link href={authors[author].link} className="text-foreground text-sm mx-1 hover:text-primary">
      {author}
    </Link>
  )
}

export function PluginCard({plugin}: {plugin: AllOfAPlugin}) {
  const authorCount = plugin.plugin.authors.length
  return (
    <MyCard>
        <div className="flex items-baseline justify-between mb-2">
          <Link href={`/plugins/p/${plugin.plugin.id}`} className="text-2xl font-bold text-foreground hover:text-primary ml-1 mr-5">
            {plugin.meta.name}
          </Link>

          <div className="flex items-baseline">
            <p className="text-small text-default-500">by </p>
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
            <div>
              <ActionIcon className="mx-2" color="gray">
                <Link href="https://github.com">
                  <IconBrandGithub stroke={1.5}/>
                </Link>
              </ActionIcon>
              <ActionIcon className="bg-success-200" color="teal">
                <a href="/mcdr.svg" download>
                  <IconDownload stroke={1.5}/>
                </a>
              </ActionIcon>
            </div>
          </div>
        </div>
    </MyCard>
  )
}
