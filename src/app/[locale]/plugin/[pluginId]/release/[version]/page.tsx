import { createSimplePlugin } from "@/catalogue/conversion";
import { getEverything, getPlugin, getPluginOr404 } from "@/catalogue/data";
import { AllOfAPlugin, ReleaseInfo } from "@/catalogue/meta-types";
import { staticParamsMaxSize } from "@/utils/build-utils";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ReleaseDisplay } from "./release-display";

interface PageParams {
  locale: string
  pluginId: string
  version: string
}

function getRelease(plugin: AllOfAPlugin, version: string): ReleaseInfo | undefined {
  if (plugin.release) {
    return plugin.release.releases.filter(r => r.meta.version === version)[0]
  } else {
    return undefined
  }
}

export async function generateMetadata({params}: {params: PageParams}) {
  const t = await getTranslations({locale: params.locale, namespace: 'metadata.title'})
  const plugin = await getPlugin(params.pluginId)

  let title = t('catalogue')
  if (plugin) {
    const version = decodeURIComponent(params.version)
    const pluginName = plugin?.meta?.name || '?'
    if (getRelease(plugin, version)) {
      title = t('plugin_release', {
        name: pluginName,
        version: version,
      })
    } else {
      title = t('plugin', {name: pluginName})
    }
  }

  return {title}
}

export async function generateStaticParams({params}: {params: {pluginId: string}}) {
  const plugin = await getPluginOr404(params.pluginId)
  if (plugin.release) {
    return plugin.release.releases.map(r => {
      return {version: r.meta.version}
    }).slice(0, staticParamsMaxSize)
  } else {
    return []
  }
}

export default async function Page({params}: {params: PageParams}) {
  unstable_setRequestLocale(params.locale)

  const version = decodeURIComponent(params.version)

  const plugin = await getPluginOr404(params.pluginId)
  const release = getRelease(plugin, version)
  if (!release) {
    notFound()
  }

  return (
    <ReleaseDisplay
      plugin={createSimplePlugin(plugin, (await getEverything()).authors)}
      release={release}
    />
  )
}
