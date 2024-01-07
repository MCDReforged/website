import "@/styles/globals.css";
import {Metadata, Viewport} from "next";
import {Providers} from "./providers";
import {Navbar} from "@/components/navbar";
import clsx from "clsx";
import {Footer} from "@/components/footer";

export const metadata: Metadata = {
  title: {
    default: 'MCDReforged',
    template: `%s - MCDReforged`,
  },
  icons: {
    icon: "/mcdr.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <div className="relative flex flex-col h-screen">
            <Navbar />

            <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
              {children}
            </main>

            <Footer/>
          </div>
        </Providers>
      </body>
    </html>
  );
}
