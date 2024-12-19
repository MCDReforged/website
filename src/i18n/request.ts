import { getRequestConfig } from 'next-intl/server'
import { siteConfig } from "../site/config"

const locales = siteConfig.languages

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale
  if (!locale || !locales.includes(locale as any)) {
    locale = siteConfig.defaultLanguage;
  }

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default
  };
})
