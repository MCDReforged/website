import { AllOfAPlugin } from "@/catalogue/meta-types";
import MyCard from "@/components/ui/my-card";
import { translateLangDict } from "@/utils/i18n-utils";
import { rem, Tabs, TabsList, TabsPanel, TabsTab } from "@mantine/core";
import { IconBook, IconPackageImport, IconTag } from "@tabler/icons-react";
import { useLocale } from "next-intl";
import React from "react";
import PluginIntroductionMarkdown from "./plugin-introduction-markdown";

function PluginIntroduction({plugin}: { plugin: AllOfAPlugin }) {
  return (
    <div className="mt-3 mx-2">
      <PluginIntroductionMarkdown>
        {translateLangDict(useLocale(), plugin.plugin.introduction, true) || ''}
      </PluginIntroductionMarkdown>
    </div>
  )
}

function PluginDependencies({plugin}: { plugin: AllOfAPlugin }) {
  return (
    <div className="mt-3 mx-2">
      PluginDownloads
    </div>
  )
}

function PluginReleases({plugin}: {plugin: AllOfAPlugin}) {
  return (
    <div className="mt-3 mx-2">
      PluginReleases
    </div>
  )
}

export function PluginContent({plugin}: {plugin: AllOfAPlugin }) {
  const tabTitle = (text: string, icon: React.ReactNode) => (
    <div className="flex items-center space-x-2 justify-center mb-1">
      {icon}
      <p>{text}</p>
    </div>
  )
  const iconStyle = { width: rem(16), height: rem(16) }

  return (
    <MyCard className="lg:mx-5 pb-6 pt-2">
      <Tabs defaultValue="introduction">
        <TabsList>
          <TabsTab value="introduction">
            {tabTitle("Introduction", <IconBook style={iconStyle}/>)}
          </TabsTab>
          <TabsTab value="releases">
            {tabTitle("Releases", <IconTag style={iconStyle} />)}
          </TabsTab>
          <TabsTab value="dependencies">
            {tabTitle("Dependencies", <IconPackageImport style={iconStyle} />)}
          </TabsTab>
        </TabsList>

        <TabsPanel value="introduction">
          <PluginIntroduction plugin={plugin}/>
        </TabsPanel>
        <TabsPanel value="releases">
          <PluginReleases plugin={plugin}/>
        </TabsPanel>
        <TabsPanel value="dependencies">
          <PluginDependencies plugin={plugin}/>
        </TabsPanel>
      </Tabs>
    </MyCard>
  )
}