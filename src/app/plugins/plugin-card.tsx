import { Card, CardBody, Link } from "@nextui-org/react";
import React from 'react';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { AllOfAPlugin } from "@/types/plugin-catalogue-meta";
import { PluginLabel } from "@/components/plugins/label";
import { Button } from "@nextui-org/button";
import { FaDownload, FaGithub } from "react-icons/fa";
import { getAuthors } from "@/data/utils";

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
    <Card shadow="sm" radius="md">
      <CardBody>
        <div className="flex items-baseline justify-between mb-2">
          <Link href={`/plugins/plugin/${plugin.plugin.id}`} className="text-2xl font-bold text-foreground hover:text-primary ml-1 mr-5">
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
            <div>
              {plugin.plugin.labels.map((label, index) =>
                <PluginLabel key={index} label={label}/>
              )}
            </div>
          </div>

          <div className="col-span-1 place-self-end flex">
            <div>
              <Button isIconOnly className="bg-foreground-200 mx-2">
                <Link href="https://github.com" color="foreground">
                  <FaGithub/>
                </Link>
              </Button>
              <Button isIconOnly className="bg-success-200">
                <Link href="/mcdr.svg" download color="foreground">
                  <FaDownload/>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
