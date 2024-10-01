import { AllOfAPlugin } from "@/catalogue/meta-types";
import GfmMarkdown from "@/components/markdown/gfm-markdown";
import { NaLink } from "@/components/na-link";
import { NoneText } from "@/components/none-text";
import { getTranslations } from "next-intl/server";
import React from "react";
import { rawToRelative } from "@/utils/repos-utils";

export async function PluginContentReadme({plugin}: { plugin: AllOfAPlugin }) {
  const t = await getTranslations('page.plugin.readme')

  const readme = plugin.repository?.readme
  const readmeUrl = plugin.repository?.readme_url
  if (!readme || !readmeUrl) {
    return <NoneText>{t('no_readme')}</NoneText>
  }

  let readmeSrc: React.ReactNode = <span>N/A</span>
  if (readmeUrl) {
    const ld = rawToRelative(readmeUrl, plugin.plugin.repository, plugin.plugin.branch)
    if (ld) {
      readmeSrc = <NaLink href={ld.href} hoverUnderline>{ld.display}</NaLink>
    } else {
      readmeSrc = <NaLink href={readmeUrl} hoverUnderline>{readmeUrl}</NaLink>
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
