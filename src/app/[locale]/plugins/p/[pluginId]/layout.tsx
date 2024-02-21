import { createSimplePlugin } from "@/catalogue/conversion";
import { getEverything, getPlugin, getPluginOr404 } from "@/catalogue/data";
import { Divider } from "@mantine/core";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import React from "react";
import { LayoutScrollFix } from "./layout-scroll-fix";
import { PluginContentCard } from "./plugin-content-card";
import { Sidebar } from "./sidebar";

export async function generateMetadata({params: {locale, pluginId}}: {params: {locale: string, pluginId: string}}) {
  const t = await getTranslations({locale, namespace: 'metadata.title'})
  const plugin = await getPlugin(pluginId)
  return {
    title: plugin
      ? t('plugin', {name: plugin?.meta?.name || '?'})
      : t('catalogue')
  }
}

export async function generateStaticParams() {
  const everything = await getEverything()
  return Object.keys(everything.plugins).map(pluginId => ({pluginId}))
}

interface LayoutProps {
  children: React.ReactNode
  params: { pluginId: string, locale: string }
}

export default async function Layout({children, params: {locale, pluginId}}: LayoutProps) {
  unstable_setRequestLocale(locale)
  const plugin = await getPluginOr404(pluginId)
  const everything = await getEverything()
  const timestamp = everything.timestamp

  return (
    <>
      <LayoutScrollFix pluginId={pluginId}/>
      <div className="md:fixed md:w-sidebar-width md:h-[calc(100vh-5rem)] md:overflow-y-auto">
        <Sidebar plugin={plugin} simplePlugin={createSimplePlugin(plugin, everything.authors)} timestamp={timestamp}/>
      </div>
      <div className="flex md:hidden">
        <Divider className="w-full m-6" variant="dashed"/>
      </div>
      <div className="md:pl-sidebar-width">
        <PluginContentCard pluginId={pluginId}>
          {children}
        </PluginContentCard>
      </div>
    </>
  )
}
