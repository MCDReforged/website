"use client";

import { AllOfAPlugin } from "@/types/plugin-catalogue-meta";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React from "react";
import { Card, Tab, Tabs } from "@nextui-org/react";
import { GoBook, GoPackageDependencies, GoTag } from "react-icons/go";

function PluginIntroduction({plugin}: {plugin: AllOfAPlugin}) {
  return (
    <div className="mt-1 mx-5">
      <div className="markdown-body">
        <Markdown remarkPlugins={[remarkGfm]}>{plugin.plugin.introduction['en_us']}</Markdown>
      </div>
    </div>
  )
}

function PluginDependencies({plugin}: {plugin: AllOfAPlugin}) {
  return (
    <div className="mt-1 mx-5">
      PluginDownloads
    </div>
  )
}

function PluginReleases({plugin}: {plugin: AllOfAPlugin}) {
  return (
    <div className="mt-1 mx-5">
      PluginReleases
    </div>
  )
}

export function PluginContent({plugin}: {plugin: AllOfAPlugin }) {
  const tabTitle = (text: string, icon: React.ReactNode) => (
    <div className="flex items-center space-x-2 justify-center mb-1">
      {icon}
      <p>{text}</p>
    </div>
  )

  return (
    <Card className="mx-5 pb-4" shadow="sm" radius="md">
      <Tabs
        size="lg"
        variant="underlined"
        className="mx-5 mt-2"
        classNames={{
          cursor: "w-full bg-primary-300",
          tabContent: "text-foreground-600 group-data-[selected=true]:text-primary",
        }}
      >
        <Tab
          key="introduction"
          title={tabTitle("Introduction", <GoBook />)}
        >
          <PluginIntroduction plugin={plugin}/>
        </Tab>

        <Tab
          key="releases"
          title={tabTitle("Releases", <GoTag />)}
        >
          <PluginReleases plugin={plugin}/>
        </Tab>

        <Tab
          key="dependencies"
          title={tabTitle("Dependencies", <GoPackageDependencies />)}
        >
          <PluginDependencies plugin={plugin}/>
        </Tab>
      </Tabs>
    </Card>
  )
}