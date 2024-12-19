import { setRequestLocale } from "next-intl/server";
import { HomePage } from "./homepage";

export default function Home({params: {locale}}: { params: { locale: string } }) {
  setRequestLocale(locale);

  return (
    <HomePage/>
  )
}
