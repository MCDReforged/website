import { getPlugin } from "@/catalogue/data";
import { AllOfAPlugin } from "@/catalogue/meta-types";
import GfmMarkdown from "@/components/gfm-markdown";
import { unstable_setRequestLocale } from "next-intl/server";
import React from "react";

async function PluginContentReadme({plugin}: { plugin: AllOfAPlugin }) {
  const readme = plugin.repository.readme
  return (
    <>
      {readme
        ? <GfmMarkdown allowEmbedHtml>{readme}</GfmMarkdown>  /* SSR, no need to use GfmMarkdownDynamic */
        : <p>No readme</p>
      }
    </>
  )
}

export default async function Page({params: {pluginId, locale}}: { params: { pluginId: string, locale: string } }) {
  unstable_setRequestLocale(locale);
  const plugin = await getPlugin(pluginId)

  return (
    <PluginContentReadme plugin={plugin}/>
  )
}
