'use client'

import { Link as NaLink, usePathname } from "@/common/navigation";
import { GithubIcon, McdrLogo, } from "@/components/icons";
import { LocaleSwitch } from "@/components/ui/locale-switch";
import { ThemeSwitch } from "@/components/ui/theme-switch";
import { siteConfig } from "@/config/site";
import { Burger, Menu } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconExternalLink } from "@tabler/icons-react";
import { clsx } from "clsx";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRef } from "react";
import styles from './navbar.module.css';

interface NavItem {
  label: string
  href: string
  isExternal: boolean
  checkActive: (pathname: string) => boolean
}

function NavbarLink({item}: {item: NavItem}) {
  const pathname = usePathname();
  return (
    <NaLink
      className={styles.link}
      href={item.href}
      data-active={item.checkActive(pathname) || undefined}
    >
      <div className="flex items-center">
        <p>{item.label}</p>
        {item.isExternal && <IconExternalLink size={20} strokeWidth={1.4} className="ml-1"/>}
      </div>
    </NaLink>
  )
}

function NavBarMenuLink({item, ...props}: {item: NavItem, [key: string]: any}) {
  const pathname = usePathname();
  return (
    <NaLink
      className="w-full"
      href={item.href}
      data-active={item.checkActive(pathname) || undefined}
      {...props}
    >
      <div className="flex items-center h-full">
        <p>{item.label}</p>
        {item.isExternal && <IconExternalLink size={20} strokeWidth={1.4} className="ml-1"/>}
      </div>
    </NaLink>
  )
}

export function Navbar() {
  const t = useTranslations('Navbar.navigation');
  const navItems: NavItem[] = [
    {
      label: t("home"),
      href: "/",
      isExternal: false,
      checkActive: (pathname: string) => pathname === '/',
    },
    {
      label: t("plugins"),
      href: "/plugins",
      isExternal: false,
      checkActive: (pathname: string) => pathname === "/plugins" || pathname.startsWith("/plugins/"),
    },
    {
      label: t("docs"),
      href: siteConfig.links.docs,
      isExternal: true,
      checkActive: (pathname: string) => false,
    },
  ]

  const [opened, opener] = useDisclosure(false);
  function BurgerMenu({className}: {className?: string}) {
    const burgerRef = useRef(null)
    return (
      <Menu
        width="full" radius={0}
        offset={14}
        shadow="md"
        transitionProps={{ transition: 'skew-up' }}
        classNames={{
          'itemLabel': 'text-center h-full'
        }}
        closeOnItemClick
        // // https://mantine.dev/core/menu/#navigation
        // loop={false}
        // withinPortal={false}
        // trapFocus={false}
      >
        <Menu.Target>
          <Burger className={className} size="sm" aria-label="Open navigation" ref={burgerRef}/>
        </Menu.Target>
        <Menu.Dropdown className="w-full absolute bg-mantine-background-body">
          {navItems.map((item) => (
            <Menu.Item key={item.href}>
              <NavBarMenuLink item={item}/>
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    )
  }

  // < 340px:   = [] OOO
  // < sm   :   = []MCDR   OOO
  // >= sm  :   = []MCDR xxx    OOO
  return (
    <header
      className={clsx(
        "z-40 flex sticky h-auto items-center justify-center top-0 border-solid border-b",
        styles.header,
      )}
    >
      <div className="flex flex-row flex-nowrap gap-4 items-center justify-between max-w-screen-xl w-full h-[3.5rem] px-2 sm:px-6">
        <BurgerMenu/>

        <div className="gap-3 justify-start max-sm:grow">
          <NaLink className="flex items-center gap-1" color="foreground" href="/">
            <McdrLogo size={36}/>
            <p className="hidden min-[340px]:block font-bold text-inherit">MCDReforged</p>
          </NaLink>
        </div>

        <div className="hidden sm:flex gap-2 justify-start ml-2 grow">
          {navItems.map((item) => <NavbarLink key={item.href} item={item} />)}
        </div>

        <div className="justify-end flex gap-2 items-center min-w-[7rem]">
          <Link target="_blank" href={siteConfig.links.github} aria-label="Github">
            <GithubIcon className="text-default-500"/>
          </Link>
          <LocaleSwitch/>
          <ThemeSwitch/>
        </div>
      </div>
    </header>
  );
}
