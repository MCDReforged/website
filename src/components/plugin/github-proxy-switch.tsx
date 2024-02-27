'use client'

import { NaLink } from "@/components/na-link";
import { useGithubProxyState } from "@/hooks/use-github-proxy-state";
import { Switch, Tooltip } from "@mantine/core";
import { IconRocket } from "@tabler/icons-react";
import { clsx } from "clsx";
import { useTranslations } from "next-intl";
import React from "react";

export function GithubProxySwitch({className}: {className?: string}) {
  const {proxied, setProxied} = useGithubProxyState()
  const t = useTranslations('component.github_proxy_switch')

  return (
    <div className={clsx(
      className,
      "flex gap-1 items-center",
    )}>
      <Switch
        classNames={{label: 'select-none'}}
        color="teal"
        label={
          <Tooltip label={t('tooltip')} openDelay={500}>
            <p>{t('label')}</p>
          </Tooltip>
        }
        checked={proxied}
        onChange={event => setProxied(event.currentTarget.checked)}
      />

      <NaLink href="https://mirror.ghproxy.com/" hoverColor>
        <IconRocket size={18} stroke={1.5}/>
      </NaLink>
    </div>
  )
}
