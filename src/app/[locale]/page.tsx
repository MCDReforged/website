import { HomePage } from "@/app/[locale]/homepage";
import { unstable_setRequestLocale } from "next-intl/server";

export default function Home({params: {locale}}: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);

  return (
    <HomePage/>
  )
}
