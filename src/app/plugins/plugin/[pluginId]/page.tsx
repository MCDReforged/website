import { getEverything } from "@/data/utils";
import React from "react";
import "github-markdown-css"
import { PluginContent } from "./plugin-content";
import { Sidebar } from "./sidebar";

const plugins = getEverything().plugins

export async function generateStaticParams() {
  return Object.keys(plugins).map(pluginId => {
    return {
      pluginId: pluginId
    }
  })
}

export default function Page({params}: { params: { pluginId: string } }) {
  const plugin = plugins[params.pluginId]
  return (
    <div>
      <div className="lg:fixed lg:w-[18rem]">
        <Sidebar plugin={plugin}/>
      </div>
      <div className="lg:pl-[19rem]">
        <PluginContent plugin={plugin}/>
      </div>
    </div>
  )
}