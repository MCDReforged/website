'use client'

import { siteConfig } from "@/config/site";
import { usePathname, useRouter } from "@/i18n-utils";
import { ActionIcon, Menu } from '@mantine/core';
import { IconWorld } from '@tabler/icons-react';
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from 'react';

export function LocaleSwitch() {
  const currentLocale = useLocale()
  const t = useTranslations('Navbar.locale_switch')

  const router = useRouter()
  const pathname = usePathname()

  const [isPending, startTransition] = useTransition()
  const [selectedLocale, setSelectedLocale] = useState(currentLocale)

  function onSelectChange(newLocale: string) {
    if (newLocale !== selectedLocale) {
      setSelectedLocale(newLocale)
      startTransition(() => {
        router.replace(pathname, {locale: newLocale})
      })
    }
  }

  return (
    <Menu width="6rem" radius="md" withinPortal>
      <Menu.Target>
        <ActionIcon variant="default" size="lg">
          <IconWorld stroke={1.5}/>
        </ActionIcon>
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
