import { AllOfAPlugin } from "@/catalogue/meta-types";
import { DynamicGfmMarkdown } from "@/components/ui/dynamic-gfm-markdown";
import React from "react";
import { TabBody } from "./plugin-content-common";

export function PluginContentReadme({plugin}: { plugin: AllOfAPlugin }) {
  const readme = plugin.repository.readme
  return (
    <TabBody>
      {readme ? <DynamicGfmMarkdown allowEmbedHtml>{readme}</DynamicGfmMarkdown> : <p>No readme</p>}
    </TabBody>
  )
}
