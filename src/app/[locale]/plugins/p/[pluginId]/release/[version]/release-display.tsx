import { ReleaseInfo } from "@/catalogue/meta-types";
import { SimplePlugin } from "@/catalogue/simple-types";
import { AttributeEntry } from "@/components/attribute-entry";
import { ClickableTooltip } from "@/components/clickable-tooltip";
import GfmMarkdown from "@/components/markdown/gfm-markdown";
import { PluginDependenciesAll } from "@/components/plugin/plugin-dependencies";
import { formatTime } from "@/utils/time-utils";
import { prettySize } from "@/utils/unit-utils";
import { Divider, Title } from "@mantine/core";
import { IconCalendar, IconExternalLink, IconFileDescription, IconFileDownload, IconPackageImport, IconTag, IconWeight } from "@tabler/icons-react";
import { clsx } from "clsx";
import { getTranslations } from "next-intl/server";
import React from "react";
import { DownloadSectionButton } from "./download-section-button";
import { ProxyableDownloadButton } from "./proxyable-download-button";

async function DownloadSection({release, className}: {release: ReleaseInfo, className?: string}) {
  const t = await getTranslations('page.plugin.release')

  const date = new Date(release.asset.created_at)
  return (
    <div className={clsx(className, "flex flex-col gap-6")}>
      <div className="flex flex-row flex-wrap gap-x-8 gap-y-4 mx-auto">
        <AttributeEntry label={t("version")} Icon={IconTag}>
          <p>{release.meta.version}</p>
        </AttributeEntry>
        <AttributeEntry label={t("date")} Icon={IconCalendar}>
          <ClickableTooltip label={formatTime(date, 'YYYY/MM/DD hh:mm:ss')} openDelay={500}>
            <p>{formatTime(date, 'YYYY/MM/DD')}</p>
          </ClickableTooltip>
        </AttributeEntry>
        <AttributeEntry label={t("size")} Icon={IconWeight}>
          <ClickableTooltip label={`${release.asset.size} ${t('bytes')}`} openDelay={500}>
            <p>{prettySize(release.asset.size)}</p>
          </ClickableTooltip>
        </AttributeEntry>
        <AttributeEntry label={t("downloads")} Icon={IconFileDownload}>
          <p>{release.asset.download_count}</p>
        </AttributeEntry>
      </div>

      <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 items-center mx-auto">
        <DownloadSectionButton
          color="blue"
          rightSection={<IconExternalLink size={16} stroke={1.6}/>}
          component="a"
          target="_blank"
          href={release.url}
        >
          {t('visit_release')}
        </DownloadSectionButton>
        <ProxyableDownloadButton
          className="grow"
          url={release.asset.browser_download_url}
          texts={{
            download: t('download'),
            proxySwitch: t('proxy_switch'),
            proxySwitchTooltip: t('proxy_switch_tooltip'),
          }}
        />
      </div>
    </div>
  )
}

async function ReleaseDescription({description}: { description: string | undefined | null }) {
  const t = await getTranslations('page.plugin.release')
  if (description === null || description === undefined) {
    return (
      <p>
        <i className="text-mantine-dimmed select-none">
          {t('release_body_nothing')}
        </i>
      </p>
    )
  }

  return (
    <div>
      <GfmMarkdown allowEmbedHtml>
        {description || ''}
      </GfmMarkdown>
    </div>
  )
}

async function ContentDivider({children, ...rest}: { children: React.ReactNode, [_: string]: any }) {
  return (
    <Divider
      className="w-full my-8"
      variant="dashed"
      labelPosition="center"
      label={children}
      {...rest}
    />
  )
}

export async function ReleaseDisplay({plugin, release}: { plugin: SimplePlugin, release: ReleaseInfo }) {
  const t = await getTranslations('page.plugin.release')
  const version = release.meta.version
  return (
    <>
      <div className="">
        <Title order={1} className="break-all text-center">{release.asset.name}</Title>

        <DownloadSection className="mt-5" release={release}/>

        <ContentDivider>
          <IconPackageImport size={14} stroke={1.5}/>
          <span className="ml-1">{t('dependencies')}</span>
        </ContentDivider>

        <PluginDependenciesAll meta={release.meta}/>

        <ContentDivider>
          <IconFileDescription size={14} stroke={1.5}/>
          <span className="ml-1">{t('release_notes')}</span>
        </ContentDivider>

        <ReleaseDescription description={release.description}/>
      </div>
    </>
  )
}
