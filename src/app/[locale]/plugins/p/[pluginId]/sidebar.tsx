import { AllOfAPlugin } from "@/catalogue/meta-types";
import { SimplePlugin } from "@/catalogue/simple-types";
import { Link as NaLink, Link } from "@/common/navigation";
import CommonCard from "@/components/common-card";
import { DynamicTimeAgo } from "@/components/dynamic-time-ago";
import GfmMarkdown from "@/components/gfm-markdown";
import { GithubIcon } from "@/components/icons";
import { PluginAuthorList } from "@/components/plugin/plugin-author";
import { PluginLabel } from "@/components/plugin/plugin-label";
import { translateLangDict } from "@/utils/i18n-utils";
import { getGitHubReposPair } from "@/utils/repos-utils";
import { Button, Text } from "@mantine/core";
import { IconArrowBackUp, IconDownload, IconLink, IconRefresh, IconReload, IconTag, IconUser } from "@tabler/icons-react";
import { clsx } from "clsx";
import { useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import React from "react";
import styles from './sidebar.module.css'

async function SidebarBackButton() {
  const t = await getTranslations('page.plugin.sidebar')

  return (
    <Button
      className={styles.cardLikeBorder}
      component={NaLink}
      href="/plugins"
      variant="default"
      leftSection={<IconArrowBackUp size="1rem"/>}
    >
      {t('back_button')}
    </Button>
  )
}

function PluginDescription({description}: {description: string}) {
  // SSR, no need to use DynamicGfmMarkdown
  return (
    <GfmMarkdown dgmVariant="tiny">{description}</GfmMarkdown>
  )
}

interface AttributeEntryProps {
  Icon: React.ElementType
  label: string
  children: React.ReactNode
  [containerPropKey: string]: any
}

function AttributeEntry({Icon, label, children, ...containerProps}: AttributeEntryProps) {
  return (
    <div>
      <p className={clsx("text-lg font-semibold mb-0.5", styles.attributeEntryTitle)}>{label}</p>
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

  const linkClass = 'hover:text-mantine-primary-7'
  const textClass = 'overflow-hidden overflow-ellipsis break-words'
  const linkTextClass = clsx(textClass, linkClass)

  const reposPair = getGitHubReposPair(simplePlugin.repos)
  const homepage = reposPair + ' @ ' + plugin.plugin.branch

  const lastUpdateText = simplePlugin.recentUpdated !== undefined
    ? <DynamicTimeAgo date={simplePlugin.recentUpdated}/>
    : <p>N/A</p>
  const syncTimeText = <DynamicTimeAgo date={new Date(timestamp * 1000)}/>

  return (
    <div className="mx-[8px] flex flex-col gap-5">
      <CommonCard className="p-5">
        <div className="flex flex-col gap-3 break-words">
          <p className="text-2xl font-semibold">{simplePlugin.name}</p>
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
        <div className="flex flex-col gap-3">
          <AttributeEntry Icon={IconUser} label={t('author')}>
            <PluginAuthorList authors={simplePlugin.authors} linkClassName={linkClass} wrap/>
          </AttributeEntry>
          <AttributeEntry Icon={GithubIcon} label={t('repository')}>
            <Link href={simplePlugin.repos} className={linkTextClass}>
              <Text lineClamp={2}>{reposPair}</Text>
            </Link>
          </AttributeEntry>
          <AttributeEntry Icon={IconLink} label={t('homepage')}>
            <Link href={simplePlugin.reposHome} className={linkTextClass}>
              <Text lineClamp={2}>{homepage}</Text>
            </Link>
          </AttributeEntry>
          <AttributeEntry Icon={IconReload} label={t('last_update')}>
            {lastUpdateText}
          </AttributeEntry>
          <AttributeEntry Icon={IconTag} label={t('latest_version')}>
          {simplePlugin.latestRelease !== undefined
              ? <Link href={simplePlugin.latestRelease.url} className={linkTextClass}>{simplePlugin.latestRelease.version}</Link>
              : <p className={textClass}>N/A</p> }
          </AttributeEntry>
          <AttributeEntry Icon={IconDownload} label={t('total_downloads')}>
            <p className={textClass}>{simplePlugin.downloads}</p>
          </AttributeEntry>
          <AttributeEntry Icon={IconRefresh} label={t('sync_at')}>
            {syncTimeText}
          </AttributeEntry>
        </div>
      </CommonCard>

      <SidebarBackButton/>
    </div>
  )
}
