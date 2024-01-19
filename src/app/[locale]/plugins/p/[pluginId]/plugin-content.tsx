import { PrettySize } from "@/app/[locale]/plugins/p/[pluginId]/utils";
import { AllOfAPlugin } from "@/catalogue/meta-types";
import MyCard from "@/components/ui/my-card";
import { translateLangDict } from "@/utils/i18n-utils";
import {
  ActionIcon,
  rem,
  ScrollArea,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Tooltip
} from "@mantine/core";
import { IconBook, IconDownload, IconPackageImport, IconTag } from "@tabler/icons-react";
import { clsx } from "clsx";
import { useLocale, useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import React from "react";
import PluginIntroductionMarkdown from "./plugin-introduction-markdown";

function TabBody({children, className, ...props}: {children: React.ReactNode, className?: string, [_: string]: any}) {
  return (
    <div className={clsx(className, "mt-3 mx-2")} {...props}>
      {children}
    </div>
  )
}

function PluginIntroduction({plugin}: { plugin: AllOfAPlugin }) {
  return (
    <TabBody>
      <PluginIntroductionMarkdown>
        {translateLangDict(useLocale(), plugin.plugin.introduction, true) || ''}
      </PluginIntroductionMarkdown>
    </TabBody>
  )
}

function PluginReleases({plugin}: {plugin: AllOfAPlugin}) {
  const t = useTranslations('PluginPage.releases');

  const titles = (
    <TableTr>
      <TableTh>{t('version')}</TableTh>
      <TableTh>{t('file')}</TableTh>
      <TableTh>{t('size')}</TableTh>
      <TableTh>{t('downloads')}</TableTh>
      <TableTh>{t('actions')}</TableTh>
    </TableTr>
  )
  const rows = plugin.release.releases.map((ri) => {
    const version = ri.meta.version
    return (
      <TableTr key={ri.tag_name}>
        <TableTd>{version}</TableTd>
        <TableTd className="break-all">{ri.asset.name}</TableTd>
        <TableTd>
          <div className="flex shrink">
            <Tooltip label={`${ri.asset.size} ${t('bytes')}`}>
              <p>{PrettySize(ri.asset.size)}</p>
            </Tooltip>
          </div>
        </TableTd>
        <TableTd>{ri.asset.download_count}</TableTd>
        <TableTd>
          <ActionIcon color="teal" aria-label={`Download version ${version}`}>
            <a href={ri.asset.browser_download_url} aria-label={`Download version ${version}`} download>
              <IconDownload stroke={1.5}/>
            </a>
          </ActionIcon>
        </TableTd>
      </TableTr>
    )
  })

  return (
    <TableScrollContainer minWidth={400} className="pb-0">
      <TabBody>
        <Table>
          <TableThead>{titles}</TableThead>
          <TableTbody>{rows}</TableTbody>
        </Table>
      </TabBody>
    </TableScrollContainer>
  )
}

const DynamicPipInstallCodeHighlight = dynamic(
  () => import('./pip-install-code-highlight')
)

function PluginDependencies({plugin}: { plugin: AllOfAPlugin }) {
  const t = useTranslations('PluginPage.dependencies')
  const latestRelease = plugin.release.releases[plugin.release.latest_version_index]
  const meta = latestRelease !== undefined ? latestRelease.meta : plugin.meta
  const metaSource = latestRelease !== undefined ? `Latest release v${meta.version}` : `${plugin.plugin.branch} branch`

  function SectionTitle({children}: {children: React.ReactNode}) {
    return <p className="text-center text-xl font-bold my-1">{children}</p>
  }

  const PipInstallCodeBlock = () => (
    <div className="mt-4 border-solid border border-[var(--mantine-color-gray-2)]">
      <DynamicPipInstallCodeHighlight requirements={meta.requirements}/>
    </div>
  )

  return (
    <TabBody className="flex flex-col gap-5">
      <div>
        <p>Source: {metaSource}</p>
        <SectionTitle>{t('title_plugin')}</SectionTitle>
        <Table withTableBorder>
          <TableThead>
            <TableTr>
              <TableTh>{t('plugin_id')}</TableTh>
              <TableTh>{t('requirement')}</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {Object.entries(meta.dependencies).map(([pluginId, requirement], index) => {
              return (
                <TableTr key={index}>
                  <TableTd>{pluginId}</TableTd>
                  <TableTd>{requirement}</TableTd>
                </TableTr>
              )
            })}
          </TableTbody>
        </Table>
      </div>

      <div>
        <SectionTitle>{t('title_package')}</SectionTitle>
        <Table withTableBorder className="mb-2">
          <TableThead>
            <TableTr>
              <TableTh>{t('py_package')}</TableTh>
              <TableTh>{t('requirement')}</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {meta.requirements.map((line, index) => {
              const pkg = line.match(/^[a-zA-z0-9._[\],-]+/)?.toString() || line
              const req = line.substring(pkg.length).trimStart()
              return (
                <TableTr key={index}>
                  <TableTd>{pkg}</TableTd>
                  <TableTd>{req}</TableTd>
                </TableTr>
              )
            })}
          </TableTbody>
        </Table>
        {meta.requirements.length > 0 && <PipInstallCodeBlock />}
      </div>
    </TabBody>
  )
}

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
      <Tabs defaultValue="introduction" classNames={{list: ''}}>
        <ScrollArea scrollbars="x" scrollbarSize={5} offsetScrollbars w="full">
          <TabsList className="flex-nowrap">
            <TabsTab value="introduction">
              {tabTitle(t("introduction"), <IconBook style={iconStyle}/>)}
            </TabsTab>
            <TabsTab value="releases">
              {tabTitle(t("releases"), <IconTag style={iconStyle} />)}
            </TabsTab>
            <TabsTab value="dependencies">
              {tabTitle(t("dependencies"), <IconPackageImport style={iconStyle} />)}
            </TabsTab>
          </TabsList>
        </ScrollArea>

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
