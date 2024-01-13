import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@mantine/core/styles.css'
import { ColorSchemeScript, createTheme, MantineProvider } from '@mantine/core'
import "@/styles/globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'MCDReforged',
    template: `%s - MCDReforged`,
  },
  icons: {
    icon: "/mcdr.svg",
  },
}

const theme = createTheme({
  fontFamily: 'Open Sans, sans-serif',
  primaryColor: 'indigo',
  cursorType: 'pointer',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // noinspection HtmlRequiredTitleElement
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript/>
      </head>
      <body className={inter.className}>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <div className="relative flex flex-col min-h-screen">
            <Navbar/>

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
