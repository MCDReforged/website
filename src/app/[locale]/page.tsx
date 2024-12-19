import { setRequestLocale } from "next-intl/server";
import { HomePage } from "./homepage";

export default async function Home(props: { params: Promise<{ locale: string }> }) {
  const {locale} = await props.params

  setRequestLocale(locale);

  return (
    <HomePage/>
  )
}
