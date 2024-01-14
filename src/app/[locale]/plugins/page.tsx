import { getEverything } from "@/catalogue/utils";
import { pick } from "@/i18n-utils";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, unstable_setRequestLocale } from "next-intl/server";
import { DisplayStrategy } from "./display-strategy";
import { PluginList } from "./plugin-list";
import { Sidebar } from "./sidebar";

export default async function Page({params: {locale}}: {params: {locale: string}}) {
  unstable_setRequestLocale(locale)
  const messages = await getMessages()

  const everything = await getEverything()
  const ds: DisplayStrategy = {
    keyword: '',
    sortOrder: 'name',
    sortReversed: false,
  }

  return (
    <div>
      <NextIntlClientProvider locale={locale} messages={pick(messages, 'Plugins')}>
        <div className="lg:fixed lg:w-[18rem]">
          <Sidebar everything={everything} ds={ds}/>
        </div>
        <div className="lg:pl-[19rem]">
          <PluginList everything={everything} ds={ds}/>
        </div>
      </NextIntlClientProvider>
    </div>
  )
}
