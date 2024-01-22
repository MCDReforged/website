import { AllOfAPlugin } from "@/catalogue/meta-types";
import CommonCard from "@/components/common-card";
import { rem, ScrollArea, TabsList, TabsPanel, TabsTab } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import React from "react";
import { tabConfig } from "./plugin-content-common";
import { PluginContentDependencies } from "./plugin-content-dependencies";
import { PluginContentIntroduction } from "./plugin-content-introduction";
import { PluginContentReadme } from "./plugin-content-readme";
import { PluginContentReleases } from "./plugin-content-releases";
import { PluginContentTabs } from "./plugin-content-tabs";

export async function PluginContent({plugin}: { plugin: AllOfAPlugin }) {
  const t = await getTranslations('page.plugin.tabs');

  const tabTitle = (text: string, icon: React.ReactNode) => (
    <div className="flex items-center gap-1.5 justify-center mb-0.5 mt-0.5 pr-1">
      {icon}
      <p>{text}</p>
    </div>
  )
  const iconStyle = { width: rem(16), height: rem(16) }

  return (
    <CommonCard className="max-lg:mx-[8px] md:mx-3 pb-6 pt-2">
      <PluginContentTabs>
        <ScrollArea scrollbars="x" type="never" offsetScrollbars w="full">
          <TabsList className="flex-nowrap">
            {tabConfig.map((tc) => (
              <TabsTab key={tc.key} value={tc.key}>
                {tabTitle(t(tc.key), <tc.icon style={iconStyle}/>)}
              </TabsTab>
            ))}
          </TabsList>
        </ScrollArea>

        <TabsPanel value="introduction">
          <PluginContentIntroduction plugin={plugin}/>
        </TabsPanel>
        <TabsPanel value="readme">
          <PluginContentReadme plugin={plugin}/>
        </TabsPanel>
        <TabsPanel value="releases">
          <PluginContentReleases plugin={plugin}/>
        </TabsPanel>
        <TabsPanel value="dependencies">
          <PluginContentDependencies plugin={plugin}/>
        </TabsPanel>
      </PluginContentTabs>
    </CommonCard>
  )
}
