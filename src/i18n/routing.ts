import { siteConfig } from "@/site/config";
import { createNavigation } from 'next-intl/navigation';

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const i18nNavigation = createNavigation({
  // A list of all locales that are supported
  locales: siteConfig.languages,

  // Used when no locale matches
  defaultLocale: siteConfig.defaultLanguage,
})
