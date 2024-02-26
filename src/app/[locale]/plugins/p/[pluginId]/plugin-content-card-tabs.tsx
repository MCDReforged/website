'use client'

import { usePathname } from "@/common/navigation";
import { NaLink } from "@/components/na-link";
import { routes } from "@/config/routes";
import { ScrollArea, Tabs } from "@mantine/core";
import { Icon, IconBook, IconFileDescription, IconPackageImport, IconTags } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import React from "react";

interface TabConfig {
  key: string
  icon: Icon
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
]

export function PluginContentCardTabs({pluginId}: { pluginId: string }) {
  const t = useTranslations('page.plugin.tabs');
  const pathname = usePathname()

  const pathBase = routes.plugin(pluginId)
  const pathFor = (cfg: TabConfig) => `${pathBase}/${cfg.key}`

  let tabValue = ''
  for (let cfg of tabConfig) {
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
            tabConfig.map((cfg) => (
              <NaLink key={cfg.key} href={pathFor(cfg)} replace>
                <Tabs.Tab value={cfg.key}>
                  <div className="flex items-center gap-1.5 justify-center mb-0.5 mt-0.5 pr-1">
                    <cfg.icon size={16} stroke={1.8}/>
                    <p>{t(cfg.key)}</p>
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
