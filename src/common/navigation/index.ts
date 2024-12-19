// https://github.com/mantinedev/mantine/issues/4927
// https://github.com/joulev/nextjs13-appdir-router-events/tree/9875d235afced30732a1c238cae5c18d5d814472

import { i18nNavigation } from "@/i18n/routing";

export { Link } from "./link"
export { useRouter } from "./router"

export const { usePathname, redirect } = i18nNavigation
