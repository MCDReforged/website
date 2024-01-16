import { i18nNavigation, usePathname } from "@/common/navigation/base";
import { onStart } from "@/common/nprogress/events";
import { shouldTriggerStartEvent } from "@/common/nprogress/should-trigger-start-event";

export function useRouter(): ReturnType<typeof i18nNavigation.useRouter> {
  const pathName = usePathname()
  const router = i18nNavigation.useRouter()
  return {
    ...router,
    push: (href, options) => {
      if (options?.locale !== undefined || shouldTriggerStartEvent(pathName, href)) {
        onStart()
      }
      router.push(href, options);
    },
    replace: (href, options) => {
      if (options?.locale !== undefined || shouldTriggerStartEvent(pathName, href)) {
        onStart()
      }
      router.replace(href, options);
    },
  }
}
