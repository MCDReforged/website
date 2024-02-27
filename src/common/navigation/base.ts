import { siteConfig } from "@/site/config";
import { createSharedPathnamesNavigation } from "next-intl/navigation";

export const i18nNavigation = createSharedPathnamesNavigation({
  locales: siteConfig.languages,
  localePrefix: 'always',
})

export const usePathname = i18nNavigation.usePathname
export const redirect = i18nNavigation.redirect
