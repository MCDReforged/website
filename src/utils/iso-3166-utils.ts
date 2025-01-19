import isoCountries from "i18n-iso-countries";
import { getLocale, getTranslations } from "next-intl/server";

const localeToLibLang: {[locale: string]: string} = {
  'en': 'en',
  'zh-CN': 'zh',
}
const specialCodes = new Set([
  'HK', 'MO', 'TW',
  'XX', 'T1',
])

// async is to ensure it's called at the server side
export async function getCountryCodeName(code: string): Promise<string | undefined> {
  // https://www.iso.org/iso-3166-country-codes.html
  // https://developers.cloudflare.com/fundamentals/reference/http-request-headers/#cf-ipcountry
  // The CF-IPCountry header contains a two-character country code of the originating visitor’s country.
  // Besides the ISO-3166-1 alpha-2 codes, Cloudflare uses the following special country codes:
  //   XX - Used for clients without country code data.
  //   T1 - Used for clients using the Tor network.

  if (specialCodes.has(code)) {
    const t = await getTranslations('utils.iso3166')
    return t(code.toLowerCase())
  }

  const locale = await getLocale()
  const lang = localeToLibLang[locale]
  if (!lang) {
    return undefined
  }

  return isoCountries.getName(code, lang)
}
