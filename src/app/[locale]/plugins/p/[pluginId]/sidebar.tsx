import { AllOfAPlugin } from "@/catalogue/meta-types";
import { SimplePlugin } from "@/catalogue/simple-types";
import { Link } from "@/common/navigation";
import CommonCard from "@/components/common-card";
import GfmMarkdown from "@/components/gfm-markdown";
import { GithubIcon } from "@/components/icons";
import { NaLink } from "@/components/na-link";
import { PluginAuthorList } from "@/components/plugin/plugin-author";
import { PluginLabel } from "@/components/plugin/plugin-label";
import { TimeAgoDynamic } from "@/components/time-ago-dynamic";
import { translateLangDict } from "@/utils/i18n-utils";
import { getGitHubReposPair } from "@/utils/repos-utils";
import { Button } from "@mantine/core";
import { IconArrowBackUp, IconFileDownload, IconLink, IconRefresh, IconReload, IconTag, IconUser } from "@tabler/icons-react";
import { clsx } from "clsx";
import { useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import React from "react";
import styles from './sidebar.module.css'

async function SidebarBackButton() {
  const t = await getTranslations('page.plugin.sidebar')

  return (
    <Button
      className="border-mantine-border-card"
      component={Link}
      href="/plugins"
      variant="default"
      leftSection={<IconArrowBackUp size="1rem"/>}
    >
      {t('back_button')}
    </Button>
  )
}

async function PluginDescription({description}: {description: string}) {
  // SSR, no need to use GfmMarkdownDynamic
  return (
    <GfmMarkdown dgmVariant="tiny">{description}</GfmMarkdown>
  )
}

interface AttributeEntryProps {
  className?: string
  Icon: React.ElementType
  label: string
  children: React.ReactNode
  [containerPropKey: string]: any
}

function AttributeEntry({className, Icon, label, children, ...containerProps}: AttributeEntryProps) {
  return (
    <div className={className}>
      <p className={clsx("font-semibold mb-0.5 min-w-[80px]", styles.attributeEntryTitle)}>{label}</p>
      <div className="flex gap-1.5 items-start" {...containerProps}>
        <div className="w-[22px] h-[22px] mt-[2px]">
          <Icon stroke={1.5} size={22}/>
        </div>
        {children}
      </div>
    </div>
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
          <NaLink href={`/plugins/p/${simplePlugin.id}`} hoverColor>
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
          {simplePlugin.latestRelease !== undefined
              ? <NaLink href={simplePlugin.latestRelease.url} className={textClass} hoverColor>{simplePlugin.latestRelease.version}</NaLink>
              : <p className={textClass}>N/A</p> }
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
