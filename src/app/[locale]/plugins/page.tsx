import { getEverything } from "@/catalogue/utils";
import { pick } from "@/i18n-utils";
import { Divider } from "@mantine/core";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, unstable_setRequestLocale } from "next-intl/server";
import { DisplayStrategyContextProvider } from "./display-strategy-provider";
import { PluginList } from "./plugin-list";
import { Sidebar } from "./sidebar";

export default async function Page({params: {locale}}: {params: {locale: string}}) {
  unstable_setRequestLocale(locale)
  const messages = await getMessages()
  const everything = await getEverything()

  return (
    <div>
      <NextIntlClientProvider locale={locale} messages={pick(messages, 'Plugins')}>
        <DisplayStrategyContextProvider>
          <div className="lg:fixed lg:w-[18rem]">
            <Sidebar everything={everything}/>
          </div>
          <div className="flex lg:hidden">
            <Divider className="w-full m-6" variant="dashed"/>
          </div>
          <div className="lg:pl-[19rem]">
            <PluginList everything={everything}/>
          </div>
        </DisplayStrategyContextProvider>
      </NextIntlClientProvider>
    </div>
  )
}
