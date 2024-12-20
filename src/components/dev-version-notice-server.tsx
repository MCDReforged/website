import { getGitInfo } from "@/utils/git-info";
import { pick } from "@/utils/i18n-utils";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import React from "react";
import { DevVersionNotice } from "./dev-version-notice";

export async function DevVersionNoticeServer() {
  const gitInfo = await getGitInfo()
  if (gitInfo && gitInfo.isDev) {
    const locale = await getLocale()
    const messages = await getMessages()
    return (
      <NextIntlClientProvider locale={locale} messages={pick(messages, 'component.dev_version_notice')}>
        <DevVersionNotice/>
      </NextIntlClientProvider>
    )
  }
  return <></>
}
