import { siteConfig } from "@/config/site";
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: siteConfig.languages,

  // Used when no locale matches
  defaultLocale: siteConfig.defaultLanguage,
})

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en|zh-CN)/:path*']
}
