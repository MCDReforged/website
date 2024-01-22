import { unstable_setRequestLocale } from "next-intl/server";
import { HomePage } from "./homepage";

export default function Home({params: {locale}}: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);

  return (
    <HomePage/>
  )
}
