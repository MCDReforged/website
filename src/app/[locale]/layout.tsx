import { Footer } from "@/components/layout/footer";
import MantineThemeProvider from "@/components/layout/mantine-theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { RouterTransition } from "@/components/layout/router-transition";
import { siteConfig } from "@/config/site";
import { pick } from "@/utils/i18n-utils";
import { ColorSchemeScript } from '@mantine/core'
import "@/styles/globals.css";
import { clsx } from "clsx";
import type { Metadata } from 'next'
import { NextIntlClientProvider } from "next-intl";
import { getMessages, unstable_setRequestLocale } from "next-intl/server";
import '@mantine/core/styles.css'
import styles from './layout.module.css';
import { VercelScripts } from "./vercel-scripts";

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: siteConfig.titleTemplate,
  },
  description: siteConfig.description,
  icons: {
    icon: siteConfig.favicon,
  },
}

export async function generateStaticParams() {
  return siteConfig.languages.map(locale => ({locale}))
}

export default async function RootLayout({
  children,
  params: {locale},
}: {
  children: React.ReactNode
  params: {locale: string}
}) {
  unstable_setRequestLocale(locale)
  const messages = await getMessages()

  // noinspection HtmlRequiredTitleElement
  return (
    <html lang={locale}>
      <head>
        <ColorSchemeScript/>
      </head>
      <body>
        <MantineThemeProvider>
          <div className={clsx("relative flex flex-col min-h-screen", styles.mainContainer)}>
            <RouterTransition/>

            <NextIntlClientProvider locale={locale} messages={pick(messages, 'layout.nav_bar')}>
              <Navbar/>
            </NextIntlClientProvider>

            <main className="flex-grow pt-[56px]"> {/* 56px for navbar */}
              {children}
            </main>

            <Footer/>
          </div>
        </MantineThemeProvider>

        <VercelScripts/>
      </body>
    </html>
  )
}
