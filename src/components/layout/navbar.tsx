'use client'

import { usePathname } from "@/common/navigation";
import { GithubIcon, McdrLogo, } from "@/components/icons";
import { NaLink } from "@/components/na-link";
import { LocaleSwitch } from "@/components/navbar/locale-switch";
import { ThemeSwitch } from "@/components/navbar/theme-switch";
import { siteConfig } from "@/site/config";
import { Box, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBook2, IconExternalLink, IconHome, IconPackages, TablerIconsProps } from "@tabler/icons-react";
import { clsx } from "clsx";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";
import styles from './navbar.module.css';

interface NavItem {
  icon: (props: TablerIconsProps) => React.ReactNode,
  key: string
  href: string
  isExternal: boolean
  checkActive: (pathname: string) => boolean
}

const navItems: NavItem[] = [
  {
    icon: IconHome,
    key: 'home',
    href: '/',
    isExternal: false,
    checkActive: (pathname: string) => pathname === '/',
  },
  {
    icon: IconPackages,
    key: 'plugins',
    href: '/plugins',
    isExternal: false,
    checkActive: (pathname: string) => pathname === '/plugins' || pathname.startsWith('/plugins/'),
  },
  {
    icon: IconBook2,
    key: 'docs',
    href: siteConfig.links.docs,
    isExternal: true,
    checkActive: (pathname: string) => false,
  },
]

interface NavBarLinkProps {
  className?: string
  showIcon: boolean
  item: NavItem
  [key: string]: any
}

function NavbarLink({className, showIcon, item, ...props}: NavBarLinkProps) {
  const t = useTranslations('layout.nav_bar.navigation');
  const pathname = usePathname()
  const Icon = item.icon
  return (
    <NaLink
      className={clsx(styles.link, className, "hover:bg-mantine-gray-hover-background")}
      href={item.href}
      data-active={item.checkActive(pathname) || undefined}
      {...props}
    >
      <div className="flex flex-row gap-1 justify-center items-center h-full">
        {showIcon && <Icon size={20} stroke={1.4}/>}
        <p>{t(item.key)}</p>
        {item.isExternal && <IconExternalLink size={16} stroke={1.4}/>}
      </div>
    </NaLink>
  )
}

function BurgerNavMenuSwitch({className, opened, toggleOpened}: {className?: string, opened: boolean, toggleOpened: () => void}) {
  return (
    <Burger
      className={className}
      aria-label="Open navigation"
      opened={opened} onClick={toggleOpened}
    />
  )
}

function DesktopNavBar({className, navOpened, navToggle}: { className?: string, navOpened: boolean, navToggle: () => void}) {
  // < 340px:   = [] OOO
  // < sm   :   = []MCDR   OOO
  // >= sm  :   = []MCDR xxx    OOO
  return (
    <div className={clsx(
      className,
      "flex flex-row flex-nowrap gap-4 items-center justify-between",
      "max-w-screen-xl w-full px-4 sm:px-6",
    )}>
      <BurgerNavMenuSwitch className="sm:hidden" opened={navOpened} toggleOpened={navToggle}/>

      <div className="gap-3 justify-start max-sm:grow">
        <NaLink className="flex items-center gap-1" color="foreground" href="/">
          <McdrLogo size={36}/>
          <p className="hidden min-[340px]:block font-bold text-inherit">MCDReforged</p>
        </NaLink>
      </div>

      <div className="hidden sm:flex gap-3 justify-start ml-2 grow">
        {navItems.map((item) => <NavbarLink key={item.href} item={item} showIcon={false}/>)}
      </div>

      <div className="justify-end flex gap-2 items-center">
        <Link target="_blank" href={siteConfig.links.github} aria-label="Github">
          <GithubIcon className="text-default-500"/>
        </Link>
        <LocaleSwitch/>
        <ThemeSwitch/>
      </div>
    </div>
  )
}

function MobileNavMenu({navOpened, setClosed}: {  navOpened: boolean, setClosed: () => void}) {
  return (
    <Box
      className={clsx(
        "fixed top-navbar-height w-full py-3 px-6",
        "border-solid border-b border-mantine-border-card",
        styles.mobileNavMenu,
      )}
      mod={{hidden: !navOpened}}
    >
      <div className="flex flex-col gap-2 max-w-screen-xl mx-auto">
        {navItems.map((item) => (
          <NavbarLink
            key={item.href} item={item}
            className="h-[3rem] w-full"
            showIcon={true}
            onClick={setClosed}
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
          <MobileNavMenu navOpened={navOpened} setClosed={navOpener.close}/>
        </div>
      </header>

    </>
  );
}
