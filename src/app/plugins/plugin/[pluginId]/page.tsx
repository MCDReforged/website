import { getEverything } from "@/data/utils";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React from "react";
import { AllOfAPlugin } from "@/types/plugin-catalogue-meta";
import "github-markdown-css"

const plugins = getEverything().plugins

export async function generateStaticParams() {
  return Object.keys(plugins).map(pluginId => {
    return {
      pluginId: pluginId
    }
  })
}

function Sidebar() {
  return <p>sidebar</p>
}

function PluginContent({plugin}: {plugin: AllOfAPlugin}) {
  return (
    <div>
      <p>PluginContent</p>
      <p>INTRODUCTION</p>

      <div className="markdown-body">
        <Markdown remarkPlugins={[remarkGfm]}>{plugin.plugin.introduction['en_us']}</Markdown>
      </div>
    </div>
  )
}

export default function Page({ params }: { params: { pluginId: string } }) {
  const plugin = plugins[params.pluginId]
  return (
    <div>
      <h1>MCDReforged Plugin Catalogue</h1>
      <div className="flex flex-row gap-5">
        <div className="basis-1/4 border rounded">
          <Sidebar/>
        </div>
        <div className="basis-3/4 border rounded">
          <PluginContent plugin={plugin}/>
        </div>
      </div>
    </div>
  )
}