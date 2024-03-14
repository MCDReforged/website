import { pick } from "@/utils/i18n-utils";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { HashCopyButton, HashCopyButtonProps } from "./hash-copy-button";

export async function HashCopyButtonServer(props: HashCopyButtonProps) {
  const locale = await getLocale()
  const messages = await getMessages()
  return (
    <NextIntlClientProvider locale={locale} messages={pick(messages, ['page.plugin.release.copy_hash', 'page.plugin.release.copied_hash'])}>
      <HashCopyButton {...props}/>
    </NextIntlClientProvider>
  )
}
