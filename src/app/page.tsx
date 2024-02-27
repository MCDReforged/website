import { siteConfig } from "@/site/config";
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/' + siteConfig.defaultLanguage)
}
