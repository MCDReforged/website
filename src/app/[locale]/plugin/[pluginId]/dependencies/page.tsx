import { getPluginOr404 } from "@/catalogue/data";
import { AllOfAPlugin } from "@/catalogue/meta-types";
import { NoneText } from "@/components/none-text";
import { PluginDependenciesAll } from "@/components/plugin/plugin-dependencies";
import { getTranslations, setRequestLocale } from "next-intl/server";
import React from "react";

async function PageContent({plugin}: { plugin: AllOfAPlugin }) {
  const t = await getTranslations('page.plugin.dependencies')
  const latestRelease = plugin.release ? plugin.release.releases[plugin.release.latest_version_index ?? -1] : undefined
  const meta = latestRelease !== undefined ? latestRelease.meta : plugin.meta

  if (!meta) {
    return <NoneText>{t('meta_unavailable')}</NoneText>
  }

  return (
    <div>
      <PluginDependenciesAll meta={meta}/>
      <p className="mt-5 text-end text-sm text-mantine-dimmed">
        {t('meta_source', {
          src: latestRelease !== undefined
            ? t('meta_source_latest_release', {version: meta.version})
            : t('meta_source_branch', {branch: plugin.plugin.branch})
        })}
      </p>
    </div>
  )
}

export default async function Page(props: { params: Promise<{ pluginId: string, locale: string }> }) {
  const {pluginId, locale} = await props.params

  setRequestLocale(locale);
  const plugin = await getPluginOr404(pluginId)

  return (
    <PageContent plugin={plugin}/>
  )
}
