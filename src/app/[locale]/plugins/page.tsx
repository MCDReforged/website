import { getSimpleEverything } from "@/catalogue/data";
import { pick } from "@/utils/i18n-utils";
import { Divider } from "@mantine/core";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, unstable_setRequestLocale } from "next-intl/server";
import { DisplayStrategyContextProvider } from "./display-strategy-provider";
import { PluginList } from "./plugin-list";
import { Sidebar } from "./sidebar";

export default async function Page({params: {locale}}: {params: {locale: string}}) {
  unstable_setRequestLocale(locale)
  const messages = await getMessages()
  const everything = await getSimpleEverything()

  return (
    <>
      <NextIntlClientProvider locale={locale} messages={pick(messages, 'plugin_list')}>
        <DisplayStrategyContextProvider>
          <div className="md:fixed md:w-[18rem] md:h-[calc(100vh-5rem)] md:overflow-y-auto">
            <Sidebar everything={everything}/>
          </div>
          <div className="flex md:hidden">
            <Divider className="w-full m-6" variant="dashed"/>
          </div>
          <div className="md:pl-[19rem]">
            <PluginList everything={everything}/>
          </div>
        </DisplayStrategyContextProvider>
      </NextIntlClientProvider>
    </>
  )
}
