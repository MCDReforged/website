import { siteConfig } from "@/site/config";
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: siteConfig.languages,

  // Used when no locale matches
  defaultLocale: siteConfig.defaultLanguage,
})

// https://next-intl.dev/docs/routing/middleware#matcher-no-prefix
export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|[^/]*\\..*).*)',
  ]
}
