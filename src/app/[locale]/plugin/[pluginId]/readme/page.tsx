import { getPluginOr404 } from "@/catalogue/data";
import { unstable_setRequestLocale } from "next-intl/server";
import React from "react";
import { PluginContentReadme } from "./plugin-content-readme";

export default async function Page({params: {pluginId, locale}}: { params: { pluginId: string, locale: string } }) {
  unstable_setRequestLocale(locale);
  const plugin = await getPluginOr404(pluginId)

  return (
    <PluginContentReadme plugin={plugin}/>
  )
}
