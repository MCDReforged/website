import { GithubIcon, ReadTheDocsIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { Link as I18nLink } from "@/i18n-utils"
import { Button } from '@mantine/core';
import { useTranslations } from "next-intl";
import { unstable_setRequestLocale } from "next-intl/server";
import Link from "next/link";

export default function Home({params: {locale}}: {params: {locale: string}}) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('Home');

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center">
        <p className="text-5xl font-semibold">
          MCDReforged
        </p>
        <p className="text-xl mt-4">
          A rewritten version of MCDaemon, a python tool to control your Minecraft server
        </p>
        <p>
          {t('title')}
        </p>
      </div>
      <I18nLink href="/plugins">
        <Button>Plugin Catalogue</Button>
      </I18nLink>

      <div className="flex gap-3">
        <Link
          target="_blank"
          href={siteConfig.links.docs}
        >
          <Button leftSection={<ReadTheDocsIcon size={18} color={"primary"}/>} variant="default">
            Documentation
          </Button>
        </Link>
        <Link
          target="_blank"
          href={siteConfig.links.github}
        >
          <Button leftSection={<GithubIcon size={20}/>} variant="default">
            GitHub
          </Button>
        </Link>
      </div>
    </div>
  )
}
