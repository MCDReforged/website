import { LangDict } from "@/catalogue/meta-types";
import { AbstractIntlMessages } from "next-intl";

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

const localeToMcdrLang: {[locale: string]: string} = {
  'en': 'en_us',
  'zh-CN': 'zh_cn',
}

export function translateLangDict(locale: string, message: LangDict, englishFallback: boolean): string | undefined {
  const lang = localeToMcdrLang[locale]
  if (lang === undefined) {
    return undefined
  }
  let text = message[lang]
  if (text === undefined && englishFallback) {
    text = message['en_us']
  }
  return text
}
