import { PrettySize } from "@/app/[locale]/plugins/p/[pluginId]/utils";
import { AllOfAPlugin } from "@/catalogue/meta-types";
import MyCard from "@/components/ui/my-card";
import { translateLangDict } from "@/utils/i18n-utils";
import {
  ActionIcon,
  rem,
  Table,
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
        <TableTd>{ri.asset.name}</TableTd>
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
    <TabBody>
      <Table>
        <TableThead>{titles}</TableThead>
        <TableTbody>{rows}</TableTbody>
      </Table>
    </TabBody>
  )
}

function PluginDependencies({plugin}: { plugin: AllOfAPlugin }) {
  return (
    <TabBody>
      PluginDownloads
    </TabBody>
  )
}

export function PluginContent({plugin}: {plugin: AllOfAPlugin }) {
  const t = useTranslations('PluginPage.tabs');

  const tabTitle = (text: string, icon: React.ReactNode) => (
    <div className="flex items-center gap-1.5 justify-center mb-1 mt-0.5 pr-1">
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
            {tabTitle(t("introduction"), <IconBook style={iconStyle}/>)}
          </TabsTab>
          <TabsTab value="releases">
            {tabTitle(t("releases"), <IconTag style={iconStyle} />)}
          </TabsTab>
          <TabsTab value="dependencies">
            {tabTitle(t("dependencies"), <IconPackageImport style={iconStyle} />)}
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