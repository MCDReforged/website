import { GithubProxySwitch } from "@/components/plugin/github-proxy-switch";
import { pick } from "@/utils/i18n-utils";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import React from "react";

export async function GithubProxySwitchServer({className}: {className?: string}) {
  const locale = await getLocale()
  const messages = await getMessages()
  return (
    <NextIntlClientProvider locale={locale} messages={pick(messages, 'component.github_proxy_switch')}>
      <GithubProxySwitch className={className}/>
    </NextIntlClientProvider>
  )
}
