import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { RouterTransition } from "@/components/layout/router-transition";
import { siteConfig } from "@/site/config";
import { pick } from "@/utils/i18n-utils";
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core'
import "@/styles/globals.css";
import "@/styles/variables.css";
import { clsx } from "clsx";
import type { Metadata } from 'next'
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import styles from './layout.module.css';
import MantineThemeProvider from "./mantine-theme-provider";
import { StatsScripts } from "./stats-scripts";
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

interface RootLayoutProps {
  children: React.ReactNode
  params: Promise<{locale: string}>
}

export default async function RootLayout(props: RootLayoutProps) {
  const {locale} = await props.params
  const {children} = props

  setRequestLocale(locale)
  const messages = await getMessages()

  // noinspection HtmlRequiredTitleElement
  return (
    <html
      lang={locale}
      {...mantineHtmlProps}  // https://github.com/mantinedev/mantine/issues/7008
    >
      <head>
        <ColorSchemeScript defaultColorScheme="auto"/>
        <StatsScripts/>
      </head>
      <body className="scrollbar-shift-fix">
        <MantineThemeProvider>
          <div className={clsx("relative flex flex-col min-h-screen", styles.mainContainer)}>
            <RouterTransition/>

            <NextIntlClientProvider locale={locale} messages={pick(messages, ['layout.nav_bar', 'urls'])}>
              <Navbar/>
            </NextIntlClientProvider>

            <main className="flex-grow pt-navbar-height">
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
