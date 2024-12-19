import { redirect } from "@/common/navigation";
import { routes } from "@/site/routes";
import { setRequestLocale } from "next-intl/server";

export default function Page({params: {locale}}: { params: { locale: string } }) {
  setRequestLocale(locale)

  redirect({href: routes.catalogue(), locale})
}
