import { AllOfAPlugin } from "@/catalogue/meta-types";
import GfmMarkdown from "@/components/ui/gfm-markdown";
import React from "react";
import { TabBody } from "./plugin-content-common";

export function PluginContentReadme({plugin}: { plugin: AllOfAPlugin }) {
  const readme = plugin.repository.readme
  return (
    <TabBody>
      {readme
        ? <GfmMarkdown allowEmbedHtml>{readme}</GfmMarkdown>  /* SSR, no need to use DynamicGfmMarkdown */
        : <p>No readme</p>
      }
    </TabBody>
  )
}
