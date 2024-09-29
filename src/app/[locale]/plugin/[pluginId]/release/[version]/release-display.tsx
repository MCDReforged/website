import { ReleaseInfo } from "@/catalogue/meta-types";
import { SimplePlugin } from "@/catalogue/simple-types";
import { AttributeEntry } from "@/components/attribute-entry";
import { ClickableTooltip } from "@/components/clickable-tooltip";
import GfmMarkdown from "@/components/markdown/gfm-markdown";
import { NoneText } from "@/components/none-text";
import { GithubProxySwitchServer } from "@/components/plugin/github-proxy-switch-server";
import { PluginDependenciesAll } from "@/components/plugin/plugin-dependencies";
import { TimeFormatted } from "@/components/time-formatted";
import { prettySize } from "@/utils/unit-utils";
import { Divider, Title } from "@mantine/core";
import { IconCalendar, IconExternalLink, IconFileDescription, IconFileDownload, IconPackageImport, IconSparkles, IconTag, IconWeight } from "@tabler/icons-react";
import { clsx } from "clsx";
import { getTranslations } from "next-intl/server";
import React from "react";
import { DownloadSectionButton } from "./download-section-button";
import { HashCopyButton } from "./hash-copy-button";
import { ProxyableDownloadButton } from "./proxyable-download-button";

async function HashDisplay({kind, hash}: {kind: string, hash: string}) {
  return (
    <div className="flex gap-1 items-center align-center">
      <p className="min-[300px]:min-w-[70px] font-bold text-color-attribute-entry">{kind}</p>
      <div className="overflow-hidden overflow-ellipsis whitespace-nowrap relative bottom-[1px]">
        <code className="text-[14px] px-[4px] py-[1px] rounded bg-mantine-light-gray-background">{hash}</code>
      </div>
      <HashCopyButton value={hash}/>
    </div>
  )
}

async function DownloadSection({release, className}: { release: ReleaseInfo, className?: string }) {
  const t = await getTranslations('page.plugin.release')

  const date = new Date(release.asset.created_at)
  return (
    <div className={clsx(className, 'flex flex-col gap-6')}>
      <div className="flex flex-row flex-wrap gap-x-8 gap-y-4 mx-auto">
        <AttributeEntry label={t("version")} Icon={IconTag}>
          <p>{release.meta.version}</p>
        </AttributeEntry>
        <AttributeEntry label={t("date")} Icon={IconCalendar}>
          <TimeFormatted date={date} format="LL" hoverFormat="LLLL" hoverOpenDelay={500}/>
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

      <div className="grid grid-cols-2 flex-wrap gap-x-4 gap-y-2 items-center">
        <DownloadSectionButton
          className="max-sm:col-span-2 place-self-end"
          color="blue"
          rightSection={<IconExternalLink size={16} stroke={1.6}/>}
          component="a"
          target="_blank"
          href={release.url}
        >
          {t('visit_release')}
        </DownloadSectionButton>

        <div className="max-sm:col-span-2 flex flex-col gap-2">
          <ProxyableDownloadButton rawUrl={release.asset.browser_download_url}>
            {t('download')}
          </ProxyableDownloadButton>
        </div>

        <div className="max-lg:hidden"/>
        <GithubProxySwitchServer className="max-sm:justify-end max-lg:justify-center max-lg:col-span-2"/>
      </div>

      <div className="flex flex-col gap-1 sm:px-6">
        <HashDisplay kind="MD5" hash={release.asset.hash_md5}/>
        <HashDisplay kind="SHA256" hash={release.asset.hash_sha256}/>
      </div>
    </div>
  )
}

async function ReleaseDescription({description, repository}: { description: string | undefined | null, repository: string }) {
  const t = await getTranslations('page.plugin.release')
  if (description === null || description === undefined) {
    return <NoneText>{t('release_body_nothing')}</NoneText>
  }

  return (
    <div>
      <GfmMarkdown allowEmbedHtml repository={repository}>
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
  const isLatest = release.meta.version === plugin.latestRelease?.version
  return (
    <>
      <div>
        <div className="flex gap-2 items-center justify-center">
          <Title order={1} className="break-all">{release.asset.name}</Title>
          {isLatest &&
            <ClickableTooltip label={t('latest_label')} position="right">
              <IconSparkles stroke={1.6} size={36} color="var(--mantine-color-teal-text)"/>
            </ClickableTooltip>
          }
        </div>

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

        <ReleaseDescription description={release.description} repository={plugin.repos}/>
      </div>
    </>
  )
}
