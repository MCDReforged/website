import { AllOfAPlugin } from "@/catalogue/meta-types";
import { DynamicGfmMarkdown } from "@/components/ui/dynamic-gfm-markdown";
import { translateLangDict } from "@/utils/i18n-utils";
import { useLocale } from "next-intl";
import React from "react";
import { TabBody } from "./plugin-content-common";

export function PluginContentIntroduction({plugin}: { plugin: AllOfAPlugin }) {
  return (
    <TabBody>
      <DynamicGfmMarkdown allowEmbedHtml>
        {translateLangDict(useLocale(), plugin.plugin.introduction, true) || ''}
      </DynamicGfmMarkdown>
    </TabBody>
  )
}
