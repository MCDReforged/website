import { createSimpleRelease } from "@/catalogue/conversion";
import { getPlugin } from "@/catalogue/data";
import { AllOfAPlugin } from "@/catalogue/meta-types";
import { SimpleRelease } from "@/catalogue/simple-types";
import GfmMarkdown from "@/components/gfm-markdown";
import { NaLink } from "@/components/na-link";
import { PluginDownloadButton } from "@/components/plugin/plugin-download-button";
import { formatTime } from "@/utils/time-utils";
import { ActionIcon, Table, TableScrollContainer, TableTbody, TableTd, TableTh, TableThead, TableTr, Tooltip } from "@mantine/core";
import { IconTag } from "@tabler/icons-react";
import { getLocale, getMessages, getTranslations, unstable_setRequestLocale } from "next-intl/server";
import React from "react";
import { PluginReleaseBodyButton } from "./release-body";
import { PrettySize } from "./utils";

async function PluginReleasePageButton({release}: {release: SimpleRelease}) {
  const t = await getTranslations('page.plugin.releases')

  const tooltip = t('button_release_page_tooltip', {version: release.version})
  return (
    <Tooltip label={tooltip}>
      <ActionIcon color="grape" variant="light" aria-label={tooltip}>
        <NaLink href={release.url} aria-label={tooltip}>
          <IconTag stroke={1.5}/>
        </NaLink>
      </ActionIcon>
    </Tooltip>
  )
}

async function PluginContentReleases({plugin}: {plugin: AllOfAPlugin}) {
  const t = await getTranslations('page.plugin.releases')
  const locale = await getLocale()
  const messages = await getMessages()

  const titles = (
    <TableTr>
      <TableTh>{t('version')}</TableTh>
      <TableTh>{t('file')}</TableTh>
      <TableTh>{t('date')}</TableTh>
      <TableTh>{t('size')}</TableTh>
      <TableTh>{t('downloads')}</TableTh>
      <TableTh>{t('actions')}</TableTh>
    </TableTr>
  )
  const rows = plugin.release.releases.map((ri) => {
    const version = ri.meta.version
    const date = new Date(ri.asset.created_at)
    const sr = createSimpleRelease(ri)
    return (
      <TableTr key={ri.tag_name}>
        <TableTd className="whitespace-nowrap">{version}</TableTd>
        <TableTd>
          <Tooltip label={ri.asset.name} openDelay={500}><p>{ri.asset.name}</p></Tooltip>
        </TableTd>
        <TableTd className="whitespace-nowrap">
          {formatTime(date , 'YYYY/MM/DD')}
        </TableTd>
        <TableTd>
          <Tooltip label={`${ri.asset.size} ${t('bytes')}`} openDelay={500}>
            <p>{PrettySize(ri.asset.size)}</p>
          </Tooltip>
        </TableTd>
        <TableTd>{ri.asset.download_count}</TableTd>
        <TableTd>
          <div className="flex flex-row gap-2">
            <PluginDownloadButton release={sr} variant="light"/>
            <PluginReleaseBodyButton
              releaseUrl={sr.url} hasDescription={!!ri.description}
              texts={{
                tooltip: t('button_release_body_tooltip', {version}),
                title: t('button_release_body_title', {version}),
                nothing: t('button_release_body_nothing', {version}),
              }}
            >
              {/* SSR, no need to dynamic */}
              <GfmMarkdown allowEmbedHtml>
                {ri.description || ''}
              </GfmMarkdown>
            </PluginReleaseBodyButton>
            <PluginReleasePageButton release={sr}/>
          </div>
        </TableTd>
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
  const plugin = await getPlugin(pluginId)

  return (
    <PluginContentReleases plugin={plugin}/>
  )
}
