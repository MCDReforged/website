import { AllOfAPlugin } from "@/catalogue/meta-types";
import GfmMarkdown from "@/components/ui/gfm-markdown";
import { translateLangDict } from "@/utils/i18n-utils";
import { useLocale } from "next-intl";
import React from "react";
import { TabBody } from "./plugin-content-common";

export function PluginContentIntroduction({plugin}: { plugin: AllOfAPlugin }) {
  const introduction = translateLangDict(useLocale(), plugin.plugin.introduction, true) || ''
  return (
    <TabBody>
      {/* SSR, no need to use DynamicGfmMarkdown */}
      <GfmMarkdown allowEmbedHtml>
        {introduction}
      </GfmMarkdown>
    </TabBody>
  )
}
