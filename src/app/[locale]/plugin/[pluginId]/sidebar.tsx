import { AllOfAPlugin } from "@/catalogue/meta-types";
import { SimplePlugin } from "@/catalogue/simple-types";
import { Link } from "@/common/navigation";
import { AttributeEntry } from "@/components/attribute-entry";
import CommonCard from "@/components/common-card";
import { GithubIcon } from "@/components/icons";
import GfmMarkdown from "@/components/markdown/gfm-markdown";
import { NaLink } from "@/components/na-link";
import { PluginAuthorList } from "@/components/plugin/plugin-author";
import { PluginLabel } from "@/components/plugin/plugin-label";
import { TimeAgoDynamic } from "@/components/time-ago-dynamic";
import { routes } from "@/site/routes";
import { translateLangDict } from "@/utils/i18n-utils";
import { getGitHubReposPair } from "@/utils/repos-utils";
import { Button } from "@mantine/core";
import { IconArrowBackUp, IconFileDownload, IconLink, IconRefresh, IconReload, IconTag, IconUser } from "@tabler/icons-react";
import { useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import React from "react";

async function SidebarBackButton() {
  const t = await getTranslations('page.plugin.sidebar')

  return (
    <Button
      className="border-mantine-border-card rounded-lg"
      component={Link}
      href="/plugins"
      variant="default"
      leftSection={<IconArrowBackUp size="1rem"/>}
    >
      <p className="text-mantine-text">{t('back_button')}</p>
    </Button>
  )
}

async function PluginDescription({description}: {description: string}) {
  // SSR, no need to use GfmMarkdownDynamic
  return (
    <GfmMarkdown dgmVariant="tiny">{description}</GfmMarkdown>
  )
}

export async function Sidebar({plugin, simplePlugin, timestamp}: {plugin: AllOfAPlugin, simplePlugin: SimplePlugin, timestamp: number}) {
  const locale = useLocale()
  const t = await getTranslations('page.plugin.sidebar')

  const textClass = 'overflow-hidden overflow-ellipsis break-words'

  const reposPair = getGitHubReposPair(simplePlugin.repos)
  const homepage = reposPair + ' @ ' + plugin.plugin.branch

  const lastUpdateText = simplePlugin.recentUpdated !== undefined
    ? <TimeAgoDynamic date={simplePlugin.recentUpdated}/>
    : <p className="text-mantine-gray-text">N/A</p>
  const syncTimeText = <TimeAgoDynamic date={new Date(timestamp * 1000)}/>

  return (
    <div className="mx-[8px] flex flex-col gap-5">
      <CommonCard className="p-5">
        <div className="flex flex-col gap-3 break-words">
          <NaLink href={routes.plugin(simplePlugin.id)} hoverColor>
            <p className="text-2xl font-semibold">{simplePlugin.name}</p>
          </NaLink>
          <PluginDescription description={translateLangDict(locale, simplePlugin.description) || ''}/>
          <div className="flex flex-row flex-wrap gap-1">
            {simplePlugin.labels.map(label => (
              <div key={label} className="">
                <PluginLabel label={label}/>
              </div>
            ))}
          </div>
        </div>
      </CommonCard>

      <CommonCard className="p-5">
        <div className="grid grid-cols-2 gap-3 justify-between">
          <AttributeEntry Icon={IconUser} label={t('author')} className="col-span-2">
            <PluginAuthorList authors={simplePlugin.authors} wrap/>
          </AttributeEntry>
          <AttributeEntry Icon={GithubIcon} label={t('repository')} className="col-span-2 break-all">
            <NaLink href={simplePlugin.repos} className={textClass} hoverColor>
              <p className="line-clamp-2">{reposPair}</p>
            </NaLink>
          </AttributeEntry>
          <AttributeEntry Icon={IconLink} label={t('homepage')} className="col-span-2 break-all">
            <NaLink href={simplePlugin.reposHome} className={textClass} hoverColor>
              <p className="line-clamp-2">{homepage}</p>
            </NaLink>
          </AttributeEntry>
          <AttributeEntry Icon={IconRefresh} label={t('sync_at')}>
            {syncTimeText}
          </AttributeEntry>
          <AttributeEntry Icon={IconReload} label={t('last_update')}>
            {lastUpdateText}
          </AttributeEntry>
          <AttributeEntry Icon={IconTag} label={t('latest_version')}>
            {
              simplePlugin.latestRelease !== undefined
                ? <NaLink
                  href={routes.pluginRelease(simplePlugin.id, simplePlugin.latestRelease.version)}
                  className={textClass}
                  hoverColor
                >
                  {simplePlugin.latestRelease.version}
                </NaLink>
                : <p className={textClass}>N/A</p>
            }
          </AttributeEntry>
          <AttributeEntry Icon={IconFileDownload} label={t('total_downloads')}>
            <p className={textClass}>{simplePlugin.downloads}</p>
          </AttributeEntry>
        </div>
      </CommonCard>

      <SidebarBackButton/>
    </div>
  )
}
