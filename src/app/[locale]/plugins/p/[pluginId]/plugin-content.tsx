"use client";

import MyCard from "@/components/ui/my-card";
import { AllOfAPlugin } from "@/types/plugin-catalogue-meta";
import { rem, Tabs } from "@mantine/core";
import { IconBook, IconPackageImport, IconTag } from "@tabler/icons-react";
import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

function PluginIntroduction({plugin}: {plugin: AllOfAPlugin}) {
  return (
    <div className="mt-3 mx-2">
      <div className="markdown-body">
        <Markdown remarkPlugins={[remarkGfm]}>{plugin.plugin.introduction['en_us']}</Markdown>
      </div>
    </div>
  )
}

function PluginDependencies({plugin}: {plugin: AllOfAPlugin}) {
  return (
    <div className="mt-3 mx-2">
      PluginDownloads
    </div>
  )
}

function PluginReleases({plugin}: {plugin: AllOfAPlugin}) {
  return (
    <div className="mt-3 mx-2">
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
  const iconStyle = { width: rem(16), height: rem(16) };

  return (
    <MyCard className="mx-5 pb-6 pt-2">
      <Tabs defaultValue="introduction">
        <Tabs.List>
          <Tabs.Tab value="introduction">
            {tabTitle("Introduction", <IconBook style={iconStyle}/>)}
          </Tabs.Tab>
          <Tabs.Tab value="releases">
            {tabTitle("Releases", <IconTag style={iconStyle} />)}
          </Tabs.Tab>
          <Tabs.Tab value="dependencies">
            {tabTitle("Dependencies", <IconPackageImport style={iconStyle} />)}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="introduction">
          <PluginIntroduction plugin={plugin}/>
        </Tabs.Panel>
        <Tabs.Panel value="releases">
          <PluginReleases plugin={plugin}/>
        </Tabs.Panel>
        <Tabs.Panel value="dependencies">
          <PluginDependencies plugin={plugin}/>
        </Tabs.Panel>
      </Tabs>
    </MyCard>
  )
}