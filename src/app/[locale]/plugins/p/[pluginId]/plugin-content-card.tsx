import CommonCard from "@/components/common-card";
import { pick } from "@/utils/i18n-utils";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import React from "react";
import { PluginContentCardTabs } from "./plugin-content-card-tabs";

export async function PluginContentCard({pluginId, children}: { pluginId: string, children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <CommonCard className="max-lg:mx-[8px] md:mx-3 pb-6 pt-2">
      <div>
        <NextIntlClientProvider locale={locale} messages={pick(messages, 'page.plugin.tabs')}>
          <PluginContentCardTabs pluginId={pluginId}/>
        </NextIntlClientProvider>
        <div className="pt-3 pb-2 px-4">
          {children}
        </div>
      </div>
    </CommonCard>
  )
}
