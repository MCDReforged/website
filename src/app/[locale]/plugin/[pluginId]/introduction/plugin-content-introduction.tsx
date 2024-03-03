import { AllOfAPlugin } from "@/catalogue/meta-types";
import GfmMarkdown from "@/components/markdown/gfm-markdown";
import { translateLangDict } from "@/utils/i18n-utils";
import { getLocale } from "next-intl/server";
import React from "react";

export async function PluginContentIntroduction({plugin}: { plugin: AllOfAPlugin }) {
  const introduction = translateLangDict(await getLocale(), plugin.plugin.introduction, true) || ''
  return (
    <>
      {/* SSR, no need to use GfmMarkdownDynamic */}
      <GfmMarkdown allowEmbedHtml>
        {introduction}
      </GfmMarkdown>
    </>
  )
}
