'use client'

import { NaLink } from "@/components/na-link";
import { siteConfig } from "@/site/config";
import { Notification } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function DevVersionNotice() {
  const t = useTranslations('component.dev_version_notice')
  const [isEnabled, setEnabled] = useState(true)
  return (
    isEnabled && <Notification
      className="fixed top-[calc(var(--mw-navbar-height)+1rem)] right-[1rem] ml-[1rem] z-[100]"
      icon={<IconAlertCircle size={32}/>}
      color="yellow"
      withBorder={true}
      radius="md"
      title={t('title')}
      onClose={() => setEnabled(false)}
    >
      <p>{t('line1')}</p>
      <p>{t.rich('line2', {
        link: (chunks) => <NaLink href={siteConfig.links.website} external={false} hoverUnderline colored>{chunks}</NaLink>
      })}</p>
    </Notification>
  )
}
