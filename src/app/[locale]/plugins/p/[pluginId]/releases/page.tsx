import { getPluginOr404 } from "@/catalogue/data";
import { AllOfAPlugin } from "@/catalogue/meta-types";
import { ClickableTooltip } from "@/components/clickable-tooltip";
import { NaLink } from "@/components/na-link";
import { routes } from "@/utils/route-utils";
import { formatTime } from "@/utils/time-utils";
import { prettySize } from "@/utils/unit-utils";
import { Table, TableScrollContainer, TableTbody, TableTd, TableTh, TableThead, TableTr } from "@mantine/core";
import { Icon, IconCalendar, IconFile, IconFileDownload, IconTag, IconWeight } from "@tabler/icons-react";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import React from "react";

async function PluginContentReleases({plugin}: {plugin: AllOfAPlugin}) {
  const t = await getTranslations('page.plugin.releases')

  function Head(props: {icon: Icon, label: string}) {
    return (
      <TableTh>
        <div className="flex gap-1 items-center">
          <props.icon size={16}/>
          <p>{props.label}</p>
        </div>
      </TableTh>
    )
  }

  const titles = (
    <TableTr>
      <Head icon={IconTag} label={t('version')} />
      <Head icon={IconFile} label={t('file')} />
      <Head icon={IconCalendar} label={t('date')} />
      <Head icon={IconWeight} label={t('size')} />
      <Head icon={IconFileDownload} label={t('downloads')} />
    </TableTr>
  )

  const rows = plugin.release.releases.map((ri) => {
    const version = ri.meta.version
    const date = new Date(ri.asset.created_at)
    const href = routes.pluginRelease(plugin.meta.id, version)
    return (
      <TableTr key={ri.tag_name}>
        <TableTd>
          <NaLink href={href} hoverColor>
            {version}
          </NaLink>
        </TableTd>
        <TableTd>
          <ClickableTooltip label={ri.asset.name} openDelay={500}>
            <p>{ri.asset.name}</p>
          </ClickableTooltip>
        </TableTd>
        <TableTd className="whitespace-nowrap">
          <ClickableTooltip label={formatTime(date , 'YYYY/MM/DD hh:mm:ss')} openDelay={500}>
            <p>{formatTime(date , 'YYYY/MM/DD')}</p>
          </ClickableTooltip>
        </TableTd>
        <TableTd>
          <ClickableTooltip label={`${ri.asset.size} ${t('bytes')}`} openDelay={500}>
            <p>{prettySize(ri.asset.size)}</p>
          </ClickableTooltip>
        </TableTd>
        <TableTd>{ri.asset.download_count}</TableTd>
      </TableTr>
    )
  })

  return (
    <TableScrollContainer minWidth={400} className="pb-0">
      <Table>
        <TableThead className="whitespace-nowrap">{titles}</TableThead>
        <TableTbody>{rows}</TableTbody>
      </Table>
    </TableScrollContainer>
  )
}

export default async function Page({params: {pluginId, locale}}: { params: { pluginId: string, locale: string } }) {
  unstable_setRequestLocale(locale);
  const plugin = await getPluginOr404(pluginId)

  return (
    <PluginContentReleases plugin={plugin}/>
  )
}
