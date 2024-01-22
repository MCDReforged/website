import { Link as NaLink } from "@/common/navigation";
import { GithubIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { Button } from '@mantine/core';
import { IconBook2, IconExternalLink, IconPackages } from "@tabler/icons-react";
import { clsx } from "clsx";
import { useTranslations } from "next-intl";
import styles from './homepage.module.css';

function Hero() {
  const t = useTranslations('page.home');

  return (
    <div className={clsx(
      "flex flex-col items-center gap-4",
      "px-4 py-8 md:py-10",
      styles.heroBackground,
    )}>
      <div className="inline-block max-w-lg text-center">
        <p className="text-4xl sm:text-5xl font-semibold">
          MCDReforged
        </p>
        <p className="text-xl mt-4">
          {t('description')}
        </p>
      </div>
      <Button leftSection={<IconPackages size={18} strokeWidth={1.4}/>} component={NaLink} href="/plugins">
        {t('catalogue')}
      </Button>

      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          leftSection={<IconBook2 size={20} strokeWidth={1.6}/>}
          rightSection={<IconExternalLink size={16} stroke={1.6}/>}
          variant="default"
          component={NaLink}
          target="_blank"
          href={siteConfig.links.docs}
        >
          {t('docs')}
        </Button>
        <Button
          leftSection={<GithubIcon size={20}/>}
          rightSection={<IconExternalLink size={16} stroke={1.6}/>}
          variant="default"
          component={NaLink}
          target="_blank"
          href={siteConfig.links.github}
        >
          {t('github')}
        </Button>
      </div>
    </div>
  )
}

export function HomePage() {
  return (
    <div>
      <Hero/>
    </div>
  )
}
