import { AbstractIntlMessages } from "next-intl";
import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { siteConfig } from "./config/site";

export const {Link, redirect, usePathname, useRouter} = createSharedPathnamesNavigation({
  locales: siteConfig.languages,
  localePrefix: 'always',
})

export function pick(messages: AbstractIntlMessages, keys: string | string[]): AbstractIntlMessages {
  if (typeof keys === 'string') {
    keys = [keys]
  }
  const newMessages: AbstractIntlMessages = {}
  keys.forEach(key => {
    const element = messages[key];
    if (element === undefined) {
        throw new Error('Key ${key} not found in provided messages')
    }
    newMessages[key] = element
  })
  return newMessages
}
