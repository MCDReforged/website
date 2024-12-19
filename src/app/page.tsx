import { siteConfig } from "@/site/config";
import { redirect as nextRedirect } from 'next/navigation';

export default function RootPage() {
  nextRedirect('/' + siteConfig.defaultLanguage)
}
