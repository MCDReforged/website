import { LangDict } from "@/catalogue/meta-types";
import { AbstractIntlMessages } from "next-intl";

export function pick(messages: AbstractIntlMessages, keys: string | string[]): AbstractIntlMessages {
  if (typeof keys === 'string') {
    keys = [keys]
  }
  const newMessages: AbstractIntlMessages = {}
  keys.forEach(key => {
    if (key.includes(".")) {
      const [base, rest] = key.split(".", 2)
      const element = messages[base]
      if (element === undefined) {
        throw new Error(`Key ${base} not found in provided messages, full key ${key}`)
      }
      if (typeof element === 'string') {
        if (rest) {
          throw new Error(`Key ${base} is not an object, full key ${key}, rest ${rest}`)
        }
        newMessages[base] = element
      } else {
        newMessages[base] = pick(element, rest)
      }
    } else {
      const element = messages[key]
      if (element === undefined) {
        throw new Error('Key ${key} not found in provided messages')
      }
      newMessages[key] = element
    }
  })
  return newMessages
}

const localeToMcdrLang: {[locale: string]: string} = {
  'en': 'en_us',
  'zh-CN': 'zh_cn',
}

export function translateLangDict(locale: string, message: LangDict, englishFallback: boolean = true): string | undefined {
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
