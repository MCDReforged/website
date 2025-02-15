'use client'

import { usePathname } from "@/common/navigation";
import { GithubIcon, McdrLogo, } from "@/components/icons";
import { NaLink } from "@/components/na-link";
import { NavbarSwitches } from "@/components/navbar/navbar-switches";
import { siteConfig } from "@/site/config";
import { routes } from "@/site/routes";
import { Box, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBook2, IconChartBar, IconExternalLink, IconHome, IconPackages, IconProps } from "@tabler/icons-react";
import { clsx } from "clsx";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";
import styles from './navbar.module.css';

interface UrlProvider {
  (key: string): string
}

interface NavItem {
  disabled?: boolean
  icon: (props: IconProps) => React.ReactNode,
  key: string
  href: (urls?: UrlProvider) => string
  isExternal: boolean
  checkActive: (pathname: string) => boolean
}

const allNavItems: NavItem[] = [
  {
    icon: IconHome,
    key: 'home',
    href: (urls) => '/',
    isExternal: false,
    checkActive: (pathname: string) => pathname === '/',
  },
  {
    icon: IconPackages,
    key: 'plugins',
    href: (urls) => '/plugins',
    isExternal: false,
    checkActive: (pathname: string) => pathname === routes.catalogue() || pathname.startsWith(routes.pluginBase() + '/'),
  },
  {
    disabled: true,
    icon: IconChartBar,
    key: 'stats',
    href: (urls) => '/stats',
    isExternal: false,
    checkActive: (pathname: string) => pathname === routes.stats(),
  },
  {
    icon: IconBook2,
    key: 'docs',
    href: (urls) => urls ? urls('document') : siteConfig.links.docs,
    isExternal: true,
    checkActive: (pathname: string) => false,
  },
]

function getNavItems(): NavItem[] {
  return allNavItems.filter(navItem => !navItem.disabled)
}

interface NavBarLinkProps {
  className?: string
  showIcon: boolean
  item: NavItem
  [key: string]: any
}

function NavbarLink({className, showIcon, item, ...props}: NavBarLinkProps) {
  const t = useTranslations('layout.nav_bar.navigation')
  const tUrls = useTranslations('urls')
  const pathname = usePathname()
  const Icon = item.icon
  return (
    <NaLink
      className={clsx(styles.link, className, "hover:bg-mantine-light-gray-background")}
      href={item.href(tUrls)}
      data-active={item.checkActive(pathname) || undefined}
      {...props}
    >
      <div className="flex flex-row gap-1 justify-center items-center h-full">
        {showIcon && <Icon size={20} stroke={1.5}/>}
        <p>{t(item.key)}</p>
        {item.isExternal && <IconExternalLink size={16} stroke={1.5}/>}
      </div>
    </NaLink>
  )
}

interface BurgerNavMenuSwitchProps {
  className?: string
  opened: boolean
  toggleOpened: () => void
}

function BurgerNavMenuSwitch({className, opened, toggleOpened}: BurgerNavMenuSwitchProps) {
  return (
    <Burger
      className={className}
      aria-label="Open navigation"
      opened={opened} onClick={toggleOpened}
    />
  )
}

interface DesktopNavBarProps {
  className?: string
  navOpened: boolean
  navToggle: () => void
}

function DesktopNavBar(props: DesktopNavBarProps) {
  // < 340px:   = [] OOO
  // < sm   :   = []MCDR   OOO
  // >= sm  :   = []MCDR xxx    OOO
  return (
    <div className={clsx(
      props.className,
      "flex flex-row flex-nowrap gap-4 items-center justify-between",
      "max-w-screen-xl w-full px-4 sm:px-6",
    )}>
      <BurgerNavMenuSwitch className="sm:hidden" opened={props.navOpened} toggleOpened={props.navToggle}/>

      <div className="gap-3 justify-start max-sm:grow">
        <NaLink className="flex items-center gap-1" color="foreground" href="/">
          <McdrLogo size={36}/>
          <p className="hidden min-[340px]:block font-bold text-inherit">MCDReforged</p>
        </NaLink>
      </div>

      <div className="hidden sm:flex gap-3 justify-start ml-2 grow">
        {getNavItems().map((item) => (
          <NavbarLink key={item.key} item={item} showIcon={false}/>
        ))}
      </div>

      <div className="justify-end flex gap-2 items-center">
        <Link target="_blank" href={siteConfig.links.githubMcdr} aria-label="Github">
          <GithubIcon className="text-default-500"/>
        </Link>
        <NavbarSwitches />
      </div>
    </div>
  )
}

interface MobileNavMenuProps {
  navOpened: boolean
  setClosed: () => void
}

function MobileNavMenu(props: MobileNavMenuProps) {
  return (
    <Box
      className={clsx(
        "fixed top-navbar-height w-full py-3 px-6",
        "border-solid border-b border-mantine-border-card",
        styles.mobileNavMenu,
      )}
      mod={{hidden: !props.navOpened}}
    >
      <div className="flex flex-col gap-2 max-w-screen-xl mx-auto">
        {getNavItems().map((item) => (
          <NavbarLink
            key={item.key} item={item}
            className="h-[3rem] w-full"
            showIcon={true}
            onClick={props.setClosed}
          />
        ))}
      </div>
    </Box>
  )
}

export function Navbar() {
  const [navOpened, navOpener] = useDisclosure(false);
  return (
    <>
      <header
        className={clsx(
          "z-40 top-0 w-full h-navbar-height",
          "flex flex-row fixed items-center justify-center",
          "border-solid border-b border-mantine-border-card",
          "bg-mantine-background-body",
        )}
      >
        <div className="scrollbar-shift-fix grow flex flex-col items-center">
          <DesktopNavBar navOpened={navOpened} navToggle={navOpener.toggle}/>
          <MobileNavMenu  navOpened={navOpened} setClosed={navOpener.close}/>
        </div>
      </header>
    </>
  );
}
