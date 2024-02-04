import { createSimpleRelease } from "@/catalogue/conversion";
import { AllOfAPlugin } from "@/catalogue/meta-types";
import { SimpleRelease } from "@/catalogue/simple-types";
import GfmMarkdown from "@/components/gfm-markdown";
import { NaLink } from "@/components/na-link";
import { PluginDownloadButton } from "@/components/plugin/plugin-download-button";
import { pick } from "@/utils/i18n-utils";
import { formatTime } from "@/utils/time-utils";
import { ActionIcon, Table, TableScrollContainer, TableTbody, TableTd, TableTh, TableThead, TableTr, Tooltip } from "@mantine/core";
import { IconTag } from "@tabler/icons-react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import React from "react";
import { TabBody } from "./plugin-content-common"
import { PluginReleaseBodyButton } from "./plugin-content-releases-body";
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

export async function PluginContentReleases({plugin}: {plugin: AllOfAPlugin}) {
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
          <NextIntlClientProvider locale={locale} messages={pick(messages, ['page.plugin.releases', 'component'])}>
            <div className="flex flex-row gap-2">
              <PluginDownloadButton release={sr} variant="light"/>
              <PluginReleaseBodyButton version={version} releaseUrl={sr.url} hasDescription={!!ri.description}>
                {/* SSR, no need to dynamic */}
                <GfmMarkdown allowEmbedHtml>
                  {ri.description || ''}
                </GfmMarkdown>
              </PluginReleaseBodyButton>
              <PluginReleasePageButton release={sr}/>
            </div>
          </NextIntlClientProvider>
        </TableTd>
      </TableTr>
    )
  })

  return (
    <TableScrollContainer minWidth={400} className="pb-0">
      <TabBody>
        <Table>
          <TableThead className="whitespace-nowrap">{titles}</TableThead>
          <TableTbody>{rows}</TableTbody>
        </Table>
      </TabBody>
    </TableScrollContainer>
  )
}
