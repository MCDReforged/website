import { getPluginOr404 } from "@/catalogue/data";
import { AllOfAPlugin } from "@/catalogue/meta-types";
import GfmMarkdown from "@/components/markdown/gfm-markdown";
import { NaLink } from "@/components/na-link";
import { NoneText } from "@/components/none-text";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import React from "react";

async function PluginContentReadme({plugin}: { plugin: AllOfAPlugin }) {
  const t = await getTranslations('page.plugin.readme')

  const readme = plugin.repository?.readme
  const readmeUrl = plugin.repository?.readme_url
  if (!readme || !readmeUrl) {
    return <NoneText>{t('no_readme')}</NoneText>
  }

  let readmeSrc: React.ReactNode = <span>N/A</span>
  if (readmeUrl) {
    // TISUnion/QuickBackupM/master/README.md
    const parts = readmeUrl?.replace(/https:\/\/raw.githubusercontent.com\//, '').split('/')
    if (parts && parts.length >= 4) {
      const reposPair = parts.slice(0, 2).join('/')
      const reposUrl = `https://github.com/${reposPair}`
      const branch = parts[2]
      const path = parts.slice(3).join('/')
      if (reposUrl === plugin.plugin.repository && branch === plugin.plugin.branch) {
        // https://raw.githubusercontent.com/TISUnion/QuickBackupM/master/README.md
        // https://github.com/TISUnion/QuickBackupM/blob/master/README.md
        readmeSrc = <NaLink href={`${reposUrl}/blob/${branch}/${path}`} hoverUnderline>{path}</NaLink>
      } else {
        readmeSrc = <NaLink href={readmeUrl} hoverUnderline>{readmeUrl}</NaLink>
      }
    }
  }

  return (
    <div>
      {/* SSR, no need to use GfmMarkdownDynamic */}
      <GfmMarkdown allowEmbedHtml allowAnchor repository={plugin.plugin.repository}>
        {readme}
      </GfmMarkdown>

      <p className="mt-5 text-end text-sm text-mantine-dimmed">
        {t('readme_source')}
        {readmeSrc}
      </p>
    </div>
  )
}

export default async function Page({params: {pluginId, locale}}: { params: { pluginId: string, locale: string } }) {
  unstable_setRequestLocale(locale);
  const plugin = await getPluginOr404(pluginId)

  return (
    <PluginContentReadme plugin={plugin}/>
  )
}
