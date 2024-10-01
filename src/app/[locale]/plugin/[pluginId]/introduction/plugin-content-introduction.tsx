import { AllOfAPlugin } from "@/catalogue/meta-types";
import GfmMarkdown from "@/components/markdown/gfm-markdown";
import { translateLangDict } from "@/utils/i18n-utils";
import { getLocale, getTranslations } from "next-intl/server";
import React from "react";
import { NaLink } from "@/components/na-link";
import { rawToRelative } from "@/utils/repos-utils";

export async function PluginContentIntroduction({plugin}: { plugin: AllOfAPlugin }) {
  const t = await getTranslations('page.plugin.introduction')
  const locale = await getLocale()

  const introduction = translateLangDict(locale, plugin.plugin.introduction, true) || ''
  let introductionSrc: React.ReactNode = <span>N/A</span>
  const introductionUrl = translateLangDict(locale, plugin.plugin.introduction_urls, false)
  if (introductionUrl) {
    let ld = rawToRelative(introductionUrl, plugin.plugin.repository, plugin.plugin.branch)
    if (ld) {
      introductionSrc = <NaLink href={ld.href} hoverUnderline>{ld.display}</NaLink>
    } else {
      ld = rawToRelative(introductionUrl, 'https://github.com/MCDReforged/PluginCatalogue', 'master')
      if (ld) {
        introductionSrc = <NaLink href={ld.href} hoverUnderline>{t('plugin_catalogue')} {ld.display.split('/').pop()}</NaLink>
      } else {
        introductionSrc = <NaLink href={introductionUrl} hoverUnderline>{introductionUrl}</NaLink>
      }
    }
  }

  return (
    <>
      {/* SSR, no need to use GfmMarkdownDynamic */}
      <GfmMarkdown allowEmbedHtml allowAnchor repository={plugin.plugin.repository}>
        {introduction}
      </GfmMarkdown>

      <p className="mt-5 text-end text-sm text-mantine-dimmed">
        {t('introduction_source')}
        {introductionSrc}
      </p>
    </>
  )
}
