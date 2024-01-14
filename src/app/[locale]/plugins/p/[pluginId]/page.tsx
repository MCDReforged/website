import { getAllPlugins, getPlugin } from "@/catalogue/utils";
import React from "react";
import "github-markdown-css"
import { PluginContent } from "./plugin-content";
import { Sidebar } from "./sidebar";

export async function generateStaticParams() {
  const allPlugins = await getAllPlugins()
  return Object.keys(allPlugins).map(pluginId => {
    return {
      pluginId: pluginId
    }
  })
}

export default async function Page({params}: { params: { pluginId: string } }) {
  const plugin = await getPlugin(params.pluginId)
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