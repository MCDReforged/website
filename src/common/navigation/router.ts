import { onStart } from "@/common/nprogress/events";
import { shouldTriggerStartEvent } from "@/common/nprogress/should-trigger-start-event";
import { i18nNavigation } from "@/i18n/routing";

export function useRouter(nprogress: boolean = true): ReturnType<typeof i18nNavigation.useRouter> {
  const pathName = i18nNavigation.usePathname()
  const router = i18nNavigation.useRouter()
  function getHrefString(href: string | {pathname: string}): string {
    if (typeof href === 'string') {
      return href
    } else {
      return href.pathname
    }
  }
  return {
    ...router,
    push: (href, options) => {
      if (nprogress && (options?.locale !== undefined || shouldTriggerStartEvent(pathName, getHrefString(href)))) {
        onStart()
      }
      router.push(href, options);
    },
    replace: (href, options) => {
      if (nprogress && (options?.locale !== undefined || shouldTriggerStartEvent(pathName, getHrefString(href)))) {
        onStart()
      }
      router.replace(href, options);
    },
  }
}
