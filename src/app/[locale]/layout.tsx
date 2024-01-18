import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { RouterTransition } from "@/components/layout/router-transition";
import { siteConfig } from "@/config/site";
import { theme } from "@/config/theme";
import { pick } from "@/utils/i18n-utils";
import { ColorSchemeScript, MantineProvider } from '@mantine/core'
import "@/styles/globals.css";
import { clsx } from "clsx";
import type { Metadata } from 'next'
import { NextIntlClientProvider } from "next-intl";
import { getMessages, unstable_setRequestLocale } from "next-intl/server";
import '@mantine/core/styles.css'
import { Inter } from 'next/font/google'
import styles from './layout.module.css';
import { VercelScripts } from "./vercel-scripts";

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <div className={clsx("relative flex flex-col min-h-screen", styles.mainContainer)}>
            <RouterTransition/>

            <NextIntlClientProvider locale={locale} messages={pick(messages, 'Navbar')}>
              <Navbar/>
            </NextIntlClientProvider>

            <main className="container mx-auto max-w-6xl px-2 py-6 flex-grow">
              <div className="mr-[15px]"> {/* assuming scrollbar width is 15px*/}
                {children}
              </div>
            </main>

            <Footer/>
          </div>
        </MantineProvider>

        <VercelScripts/>
      </body>
    </html>
  )
}
