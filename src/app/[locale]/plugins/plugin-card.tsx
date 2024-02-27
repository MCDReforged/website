import { SimplePlugin, SimpleRelease } from "@/catalogue/simple-types";
import { ClickableTooltip } from "@/components/clickable-tooltip";
import CommonCard from "@/components/common-card";
import { GithubIcon } from "@/components/icons";
import { GfmMarkdownDynamic } from "@/components/markdown/gfm-markdown-dynamic";
import { NaLink } from "@/components/na-link";
import { PluginAuthorList } from "@/components/plugin/plugin-author";
import { PluginLabel } from "@/components/plugin/plugin-label";
import { TimeAgoDynamic } from "@/components/time-ago-dynamic";
import { routes } from "@/site/routes";
import { translateLangDict } from "@/utils/i18n-utils"
import { ActionIcon } from "@mantine/core";
import { IconFileDownload, IconRefresh, IconReload, IconTag, IconTagOff } from "@tabler/icons-react";
import { clsx } from "clsx";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import React from 'react';

interface PluginCardReleaseButtonProps {
  pluginId: string
  release: SimpleRelease
  variant?: string
}

function PluginCardReleaseButton({pluginId, release, variant = 'filled'}: PluginCardReleaseButtonProps) {
  const t = useTranslations('page.plugin_list.plugin_card.release_button')

  const tooltip = t('tooltip', {version: release.version})
  return (
    <ClickableTooltip label={tooltip}>
      <ActionIcon
        color="teal"
        variant={variant}
        aria-label={tooltip}
        className={clsx(variant === 'filled' && 'text-mantine-icon-white')}
      >
        <NaLink href={routes.pluginRelease(pluginId, release.version)}>
          <IconTag stroke={1.5}/>
        </NaLink>
      </ActionIcon>
    </ClickableTooltip>
  )
}

function PluginCardReleaseButtonDisabled() {
  const t = useTranslations('page.plugin_list.plugin_card.release_button')

  // https://mantine.dev/core/action-icon/#disabled-button-with-tooltip
  return (
    <ClickableTooltip label={t('tooltip_disabled')}>
      <ActionIcon data-disabled aria-label="Download not available">
        <IconTagOff stroke={1.5}/>
      </ActionIcon>
    </ClickableTooltip>
  )
}

function PluginCardPluginLink({pluginId, pluginName}: {pluginId: string, pluginName: string}) {
  return (
    <NaLink
      href={routes.plugin(pluginId)}
      className="text-2xl font-bold text-foreground break-words mx-1"
      hoverColor
    >
      {pluginName}
    </NaLink>
  )
}

function PluginCardDescription({description}: {description: string}) {
  return (
    <GfmMarkdownDynamic dgmVariant="tiny">{description}</GfmMarkdownDynamic>
  )
}

function SmallStats({Icon, text, tooltip, fullToolTip}: { Icon: typeof IconRefresh, text: React.ReactNode, tooltip: React.ReactNode, fullToolTip: boolean }) {
  const clazz: string = "flex flex-row gap-0.5 items-center text-sm cursor-default"
  const icon = <Icon size="1rem" stroke={1.8}/>
  if (fullToolTip) {
    return (
      <ClickableTooltip label={tooltip}>
        <div className={clazz}>
          {icon}
          {text}
        </div>
      </ClickableTooltip>
    )
  } else {
    return (
      <div className={clazz}>
        <ClickableTooltip label={tooltip}>
          {icon}
        </ClickableTooltip>
        {text}
      </div>
    )
  }
}

export function PluginCard({plugin}: {plugin: SimplePlugin}) {
  const release = plugin.latestRelease

  const locale = useLocale()
  const t = useTranslations('page.plugin_list.plugin_card')

  const repositoryButton =
    <ActionIcon color="gray.7" aria-label={`Visit GitHub repository for ${plugin.id}`}>
      <Link href={plugin.repos} aria-label={`GitHub repository for ${plugin.id}`}>
        <GithubIcon/>
      </Link>
    </ActionIcon>

  const downloadButton = release !== undefined ?
    <PluginCardReleaseButton pluginId={plugin.id} release={release}/>:
    <PluginCardReleaseButtonDisabled/>

  const lastUpdateText = plugin.recentUpdated !== undefined
    ? <TimeAgoDynamic date={plugin.recentUpdated}/>
    : <p>N/A</p>
  return (
    <CommonCard className="flex flex-col">
      <div className="flex items-baseline justify-between mb-2 flex-col sm:flex-row">
        <PluginCardPluginLink pluginId={plugin.id} pluginName={plugin.name}/>

        <div className="flex items-baseline">
          <p className={clsx("text-mantine-gray-text text-sm mr-1")}>by</p>
          <PluginAuthorList authors={plugin.authors} textClassName="text-sm"/>
        </div>
      </div>

      <div className="grow w-full">
        <div className="col-span-5 flex flex-col justify-between">
          <div className="mb-3 ml-1 min-h-[25px]">
            <PluginCardDescription description={translateLangDict(locale, plugin.description, true) || ''}/>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5 items-center self-end">
              {plugin.labels.map((label, index) =>
                <PluginLabel key={index} label={label}/>
              )}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <div className="flex flex-row gap-3 self-end">
                <SmallStats Icon={IconReload} text={lastUpdateText} tooltip={t('last_update')} fullToolTip={false}/>
                <SmallStats Icon={IconFileDownload} text={<p>{plugin.downloads}</p>} tooltip={t('total_downloads')} fullToolTip={true}/>
              </div>
              <div className="flex gap-2">
                {repositoryButton}
                {downloadButton}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CommonCard>
  )
}
