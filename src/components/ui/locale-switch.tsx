'use client'

import { siteConfig } from "@/config/site";
import { usePathname, useRouter } from "@/i18n-utils";
import { Menu, UnstyledButton } from '@mantine/core';
import { IconChevronDown, IconWorld } from '@tabler/icons-react';
import { clsx } from "clsx";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from 'react';
import styles from './locale-switch.module.css';

export function LocaleSwitch() {
  const currentLocale = useLocale()
  const t = useTranslations('Navbar.LocaleSwitch')

  const router = useRouter()
  const pathname = usePathname()

  const [isPending, startTransition] = useTransition()
  const [selectedLocale, setSelectedLocale] = useState(currentLocale)
  const [opened, setOpened] = useState(false)

  function onSelectChange(newLocale: string) {
    if (newLocale !== selectedLocale) {
      console.log(`switch to new locale ${newLocale}`)
      setSelectedLocale(newLocale)
      startTransition(() => {
        router.replace(pathname, {locale: newLocale})
      })
    }
  }

  return (
    <Menu
      width="7rem"
      onOpen={() => setOpened(true)}
      onClose={() => setOpened(false)}
      radius="md"
      withinPortal
    >
      <Menu.Target>
        <UnstyledButton
          className={clsx('flex justify-between items-center p-1.5 w-[7rem]', styles.control)}
          data-expanded={opened || undefined}
        >
          <div className="flex gap-1.5 items-center">
            <IconWorld size="1.2rem" stroke={1.5}/>
            <span className="text-sm">{t(selectedLocale)}</span>
          </div>
          <IconChevronDown size="1rem" className={styles.icon} stroke={1.5} />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        {siteConfig.languages.map((locale) => (
          <Menu.Item
            onClick={() => onSelectChange(locale)}
            disabled={isPending || locale === currentLocale}
            key={locale}
          >
            {t(locale)}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
