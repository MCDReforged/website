import { fetchReadme } from "@/catalogue/data";
import { AllOfAPlugin } from "@/catalogue/meta-types";
import { DynamicGfmMarkdown } from "@/components/ui/dynamic-gfm-markdown";
import React from "react";
import { TabBody } from "./plugin-content-common";

export async function PluginContentReadme({plugin}: { plugin: AllOfAPlugin }) {
  const readme = await fetchReadme(plugin.plugin)
  return (
    <TabBody>
      {readme !== undefined ? <DynamicGfmMarkdown>{readme}</DynamicGfmMarkdown> : <p>No readme</p>}
    </TabBody>
  )
}
