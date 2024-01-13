import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { siteConfig } from "@/config/site";
import { theme } from "@/config/theme";
import { pick } from "@/i18n-utils";
import { ColorSchemeScript, MantineProvider } from '@mantine/core'
import "@/styles/globals.css";
import { clsx } from "clsx";
import type { Metadata } from 'next'
import { NextIntlClientProvider } from "next-intl";
import { getMessages, unstable_setRequestLocale } from "next-intl/server";
import { Inter } from 'next/font/google'
import '@mantine/core/styles.css'
import styles from './layout.module.css';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: siteConfig.titleTemplate,
  },
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
      <body className={inter.className}>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <div className={clsx("relative flex flex-col min-h-screen", styles.background)}>
            <NextIntlClientProvider locale={locale} messages={pick(messages, 'Navbar')}>
              <Navbar/>
            </NextIntlClientProvider>

            <main className="container mx-auto max-w-7xl p-6 flex-grow">
              {children}
            </main>

            <Footer/>
          </div>
        </MantineProvider>
      </body>
    </html>
  )
}
