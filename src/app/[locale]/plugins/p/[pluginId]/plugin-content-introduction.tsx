import { AllOfAPlugin } from "@/catalogue/meta-types";
import GfmMarkdown from "@/components/ui/gfm-markdown";
import { translateLangDict } from "@/utils/i18n-utils";
import { getLocale } from "next-intl/server";
import React from "react";
import { TabBody } from "./plugin-content-common";

export async function PluginContentIntroduction({plugin}: { plugin: AllOfAPlugin }) {
  const introduction = translateLangDict(await getLocale(), plugin.plugin.introduction, true) || ''
  return (
    <TabBody>
      {/* SSR, no need to use DynamicGfmMarkdown */}
      <GfmMarkdown allowEmbedHtml>
        {introduction}
      </GfmMarkdown>
    </TabBody>
  )
}
