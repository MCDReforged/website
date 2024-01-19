import { createSimplePlugin } from "@/catalogue/conversion";
import { getEverything, getPlugin } from "@/catalogue/data";
import { Divider } from "@mantine/core";
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
      <div className="md:fixed md:w-[18rem] md:h-[calc(100vh-5rem)] md:overflow-y-auto">
        <Sidebar plugin={createSimplePlugin(plugin)}/>
      </div>
      <div className="flex md:hidden">
        <Divider className="w-full m-6" variant="dashed"/>
      </div>
      <div className="md:pl-[19rem]">
        <PluginContent plugin={plugin}/>
      </div>
    </div>
  )
}
