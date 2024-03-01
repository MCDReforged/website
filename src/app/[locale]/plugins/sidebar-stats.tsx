import { SimpleEverything } from "@/catalogue/simple-types";
import { AttributeEntry } from "@/components/attribute-entry";
import { TimeAgoDynamic } from "@/components/time-ago-dynamic";
import { IconFileDownload, IconPackages, IconRefresh, IconUsers } from "@tabler/icons-react";
import { getTranslations } from "next-intl/server";
import React from "react";
import { CardSection, SidebarCard } from "./sidebar-common";

async function StatItem({Icon, text}: {Icon: typeof IconRefresh, text: React.ReactNode}) {
  return (
    <div className="flex flex-row gap-2 items-center">
      <Icon size={18} stroke={1.5}/>
      <>{text}</>
    </div>
  )
}

export async function StatsCard({everything}: { everything: SimpleEverything }) {
  const t = await getTranslations('page.plugin_list.sidebar')

  const allPlugins = Object.values(everything.plugins)
  const authorAmount = everything.authors.amount
  const pluginAmount = allPlugins.length
  const downloadSum = allPlugins.reduce((s, plugin) => s + plugin.downloads, 0)

  return (
    <SidebarCard>
      <CardSection title={t('stats')} className="gap-1.5">
        <div className="grid grid-cols-2 gap-3">
          <AttributeEntry Icon={IconRefresh} label={t('sync_at')}>
            <TimeAgoDynamic date={new Date(everything.timestamp * 1000)}/>
          </AttributeEntry>
          <AttributeEntry Icon={IconUsers} label={t('author_amount')}>
            {authorAmount}
          </AttributeEntry>
          <AttributeEntry Icon={IconPackages} label={t('plugin_amount')}>
            {pluginAmount}
          </AttributeEntry>
          <AttributeEntry Icon={IconFileDownload} label={t('download_sum')}>
            {downloadSum}
          </AttributeEntry>
        </div>
      </CardSection>
    </SidebarCard>
  )
}

