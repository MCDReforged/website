import { redirect } from "@/common/navigation";
import { routes } from "@/site/routes";
import { setRequestLocale } from "next-intl/server";

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const {locale} = await props.params

  setRequestLocale(locale)

  redirect({href: routes.catalogue(), locale})
}
