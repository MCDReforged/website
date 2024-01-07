import { Card, CardBody, CardFooter, CardHeader, Link } from "@nextui-org/react";
import React from 'react';
import { getEverything } from "@/data/utils";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { AllOfAPlugin } from "@/types/plugin-catalogue-meta";
import { PluginLabel } from "@/components/plugins/label";

const everything = getEverything()

function PluginAuthor({author}: {author: string}) {
  const authors = everything.authors.authors
  return (
    <Link href={authors[author].link} className="text-foreground text-sm mx-1">
      {author}
    </Link>
  )
}

function PluginCard({plugin}: {plugin: AllOfAPlugin}) {
  const authorCount = plugin.plugin.authors.length
  return (
    <Card className="m-5" shadow="sm" radius="md">
      <CardHeader className="flex gap-3">
        <div className="flex flex-row items-baseline">
          <Link href={`/plugins/plugin/${plugin.plugin.id}`} className="text-2xl text-foreground font-bold ml-1 mr-5">
            {plugin.meta.name}
          </Link>
          <p className="text-small text-default-500">by </p>
          {plugin.plugin.authors.map((author, index) =>
            <React.Fragment key={index}>
              <PluginAuthor author={author}/>
              <p>{index < authorCount - 1 && ','}</p>
            </React.Fragment>
          )}
        </div>
      </CardHeader>

      <CardBody>
        <Markdown remarkPlugins={[remarkGfm]}>{plugin.meta.description['en_us']}</Markdown>
      </CardBody>

      <CardFooter>
        <div className="flex flex-row basis-full">
          <div className="basis-1/3">
            {plugin.plugin.labels.map((label, index) =>
              <PluginLabel key={index} label={label}/>
            )}
          </div>
          <div className="basis-1/3">
            part2
          </div>
          <div className="basis-1/3">
            part3
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export function PluginList() {
  return (
    <div>
      <p className="h1">PluginList</p>
      {Object.values(everything.plugins).map(plugin => {
        return <PluginCard key={plugin.meta.id} plugin={plugin} />
      })}
    </div>
  )
}
