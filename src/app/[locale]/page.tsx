import { Link as NaLink } from "@/common/navigation";
import { GithubIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { Button } from '@mantine/core';
import { IconBook2, IconPackages } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { unstable_setRequestLocale } from "next-intl/server";

function Hero() {
  const t = useTranslations('page.home');

  return (
    <div className="flex flex-col items-center gap-4 py-8 md:py-10 bg-blue-50">
      <div className="inline-block max-w-lg text-center">
        <p className="text-4xl sm:text-5xl font-semibold">
          MCDReforged
        </p>
        <p className="text-xl mt-4">
          {t('description')}
        </p>
      </div>
      <Button leftSection={<IconPackages size={18} strokeWidth={1.4}/>} component={NaLink} href="/plugins">
        Plugin Catalogue
      </Button>

      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          leftSection={<IconBook2 size={18} strokeWidth={1.6}/>}
          variant="default"
          component={NaLink}
          target="_blank"
          href={siteConfig.links.docs}
        >
          Documentation
        </Button>
        <Button
          leftSection={<GithubIcon size={20}/>} variant="default"
          component={NaLink}
          target="_blank"
          href={siteConfig.links.github}
        >
          GitHub
        </Button>
      </div>
    </div>
  )
}

export default function Home({params: {locale}}: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);

  return (
    <div>
      <Hero/>
    </div>
  )
}
