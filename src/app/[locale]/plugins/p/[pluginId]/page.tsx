import { createSimplePlugin } from "@/catalogue/conversion";
import { getEverything, getPlugin } from "@/catalogue/data";
import { Divider } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import React from "react";
import { PluginContent } from "./plugin-content";
import { Sidebar } from "./sidebar";

export async function generateMetadata({params: {locale, pluginId}}: {params: {locale: string, pluginId: string}}) {
  const t = await getTranslations({locale, namespace: 'metadata.title'})
  const plugin = await getPlugin(pluginId)
  return {
    title: t('plugin', {name: plugin?.meta?.name || '?'}),
  }
}

export async function generateStaticParams() {
  const everything = await getEverything()
  return Object.keys(everything.plugins).map(pluginId => ({pluginId}))
}

export default async function Page({params: {locale, pluginId}}: { params: { pluginId: string, locale: string } }) {
  const everything = await getEverything()
  const plugin = everything.plugins[pluginId]
  const timestamp = everything.timestamp

  return (
    <>
      <div className="md:fixed md:w-sidebar-width md:h-[calc(100vh-5rem)] md:overflow-y-auto">
        <Sidebar plugin={plugin} simplePlugin={createSimplePlugin(plugin, everything.authors)} timestamp={timestamp}/>
      </div>
      <div className="flex md:hidden">
        <Divider className="w-full m-6 relative bottom-[1px]" variant="dashed"/>
      </div>
      <div className="md:pl-sidebar-width">
        <PluginContent plugin={plugin}/>
      </div>
    </>
  )
}
