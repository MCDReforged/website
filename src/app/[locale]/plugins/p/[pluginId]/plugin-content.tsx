import { AllOfAPlugin } from "@/catalogue/meta-types";
import MyCard from "@/components/ui/my-card";
import { rem, ScrollArea, TabsList, TabsPanel, TabsTab } from "@mantine/core";
import { useTranslations } from "next-intl";
import React from "react";
import { tabConfig } from "./plugin-content-common";
import { PluginContentDependencies } from "./plugin-content-dependencies";
import { PluginContentIntroduction } from "./plugin-content-introduction";
import { PluginContentReleases } from "./plugin-content-releases";
import { PluginContentTabs } from "./plugin-content-tabs";

export function PluginContent({plugin}: { plugin: AllOfAPlugin }) {
  const t = useTranslations('PluginPage.tabs');

  const tabTitle = (text: string, icon: React.ReactNode) => (
    <div className="flex items-center gap-1.5 justify-center mb-0.5 mt-0.5 pr-1">
      {icon}
      <p>{text}</p>
    </div>
  )
  const iconStyle = { width: rem(16), height: rem(16) }

  return (
    <MyCard className="lg:mx-5 pb-6 pt-2">
      <PluginContentTabs>
        <ScrollArea scrollbars="x" scrollbarSize={5} offsetScrollbars w="full">
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
        <TabsPanel value="releases">
          <PluginContentReleases plugin={plugin}/>
        </TabsPanel>
        <TabsPanel value="dependencies">
          <PluginContentDependencies plugin={plugin}/>
        </TabsPanel>
      </PluginContentTabs>
    </MyCard>
  )
}
