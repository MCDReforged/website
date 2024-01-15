import { getEverything, getPlugin } from "@/catalogue/data";
import React from "react";
import { PluginContent } from "./plugin-content";
import { Sidebar } from "./sidebar";

export async function generateStaticParams() {
  const everything = await getEverything()
  return Object.keys(everything.plugins).map(pluginId => {
    return {
      pluginId: pluginId
    }
  })
}

export default async function Page({params}: { params: { pluginId: string } }) {
  const plugin = await getPlugin(params.pluginId)
  return (
    <div>
      <div className="lg:fixed lg:w-[18rem] lg:h-[calc(100vh-5rem)] lg:overflow-y-auto">
        <Sidebar plugin={plugin}/>
      </div>
      <div className="lg:pl-[19rem]">
        <PluginContent plugin={plugin}/>
      </div>
    </div>
  )
}