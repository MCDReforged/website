'use client'

import { usePathname } from "@/common/navigation";
import { NaLink } from "@/components/na-link";
import { PluginTab, routes } from "@/site/routes";
import { ScrollArea, Tabs } from "@mantine/core";
import { Icon, IconAlertTriangle, IconBook, IconFileDescription, IconPackageImport, IconTags } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import React from "react";

interface TabConfig {
  key: PluginTab
  translationKey?: string
  icon: Icon
  requireUpdateReport?: boolean
}

const tabConfig: TabConfig[] = [
  {
    key: 'introduction',
    icon: IconBook,
  },
  {
    key: 'readme',
    icon: IconFileDescription,
  },
  {
    key: 'releases',
    icon: IconTags,
  },
  {
    key: 'dependencies',
    icon: IconPackageImport,
  },
  {
    key: 'alerts',
    translationKey: 'update_report',
    icon: IconAlertTriangle,
    requireUpdateReport: true,
  },
]

export function PluginContentCardTabs({pluginId, hasUpdateReport}: { pluginId: string, hasUpdateReport: boolean }) {
  const t = useTranslations('page.plugin.tabs');
  const pathname = usePathname()

  const pathBase = routes.plugin(pluginId)
  const pathFor = (cfg: TabConfig) => `${pathBase}/${cfg.key}`
  const visibleTabConfig = tabConfig.filter(cfg => !cfg.requireUpdateReport || hasUpdateReport)

  let tabValue = ''
  for (const cfg of visibleTabConfig) {
    if (
      cfg.key === 'introduction' && pathname === pathBase
      || pathname === pathFor(cfg)
      || cfg.key === 'releases' && pathname.startsWith(`${pathBase}/release/`)
    ) {
      tabValue = cfg.key
    }
  }

  return (
    <Tabs value={tabValue}>
      <ScrollArea scrollbars="x" type="never" offsetScrollbars w="full">
        <Tabs.List className="flex-nowrap">
          {
            visibleTabConfig.map((cfg) => (
              <NaLink key={cfg.key} href={pathFor(cfg)} replace>
                <Tabs.Tab value={cfg.key}>
                  <div className="flex items-center gap-1.5 justify-center mb-0.5 mt-0.5 pr-1">
                    <cfg.icon size={16} stroke={1.8}/>
                    <p>{t(cfg.translationKey ?? cfg.key)}</p>
                  </div>
                </Tabs.Tab>
              </NaLink>
            ))
          }
        </Tabs.List>
      </ScrollArea>
    </Tabs>
  )
}
