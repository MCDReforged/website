import { redirect } from "@/common/navigation";
import { routes } from "@/site/routes";
import { setRequestLocale } from "next-intl/server";

export default function Page({params: {locale, pluginId}}: { params: { locale: string, pluginId: string } }) {
  setRequestLocale(locale)

  redirect({href: routes.pluginTab(pluginId, 'releases'), locale})
}
