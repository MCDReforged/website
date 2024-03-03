import { redirect } from "@/common/navigation";
import { routes } from "@/site/routes";
import { unstable_setRequestLocale } from "next-intl/server";

export default function Page({params: {locale}}: { params: { locale: string } }) {
  unstable_setRequestLocale(locale)

  redirect(routes.catalogue())
}
