import { getPluginOr404 } from "@/catalogue/data";
import { setRequestLocale } from "next-intl/server";
import React from "react";
import { PluginContentIntroduction } from "./plugin-content-introduction";

export default async function Page(props: { params: Promise<{ pluginId: string, locale: string }> }) {
  const {pluginId, locale} = await props.params

  setRequestLocale(locale);
  const plugin = await getPluginOr404(pluginId)

  return (
    <PluginContentIntroduction plugin={plugin}/>
  )
}
