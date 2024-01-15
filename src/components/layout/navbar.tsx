'use client'

import { GithubIcon, McdrLogo, } from "@/components/icons";
import { LocaleSwitch } from "@/components/ui/locale-switch";
import { ThemeSwitch } from "@/components/ui/theme-switch";
import { siteConfig } from "@/config/site";
import { Link as NavigationLink } from "@/i18n-utils"
import { Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { clsx } from "clsx";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { NavbarLink, NavItem } from "./navbar-link";
import classes from './navbar.module.css';

export function Navbar() {
  const [burgerOpened, setBurgerOpened ] = useDisclosure(false);

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

  return (
    <header
      className={clsx(
        "z-40 flex sticky h-auto items-center justify-center top-0 border-solid border-b",
        classes.header,
      )}
    >
      <div className="z-40 flex flex-row flex-nowrap items-center justify-between max-w-screen-xl gap-6 px-6 w-full h-[3.5rem]">
        <div className="gap-3 max-w-fit">
          <NavigationLink className="flex justify-start items-center gap-1" color="foreground" href="/">
            <McdrLogo size={36}/>
            <p className="font-bold text-inherit">MCDReforged</p>
          </NavigationLink>
        </div>

        <div className="hidden sm:flex gap-4 justify-start ml-2 flex-grow">
          {navItems.map((item) => <NavbarLink key={item.href} item={item} />)}
        </div>

        <div className="justify-end flex gap-3 items-center">
          <Link target="_blank" href={siteConfig.links.github} aria-label="Github">
            <GithubIcon className="text-default-500"/>
          </Link>
          <LocaleSwitch/>
          <ThemeSwitch/>
          <Burger
            opened={burgerOpened}
            onClick={setBurgerOpened.toggle}
            hiddenFrom="xs"
            size="sm"
            aria-label="Open navigation"
          />
        </div>

      </div>

      {/*<NavbarMenu>*/}
      {/*  /!*{searchInput}*!/*/}
      {/*  <div className="mx-4 mt-2 flex flex-col gap-2">*/}
      {/*    {config.navItems.map((item, index) => (*/}
      {/*      <NavbarMenuItem key={`${item}-${index}`}>*/}
      {/*        <Link*/}
      {/*          href={item.href}*/}
      {/*          size="lg"*/}
      {/*        >*/}
      {/*          {item.label}*/}
      {/*        </Link>*/}
      {/*      </NavbarMenuItem>*/}
      {/*    ))}*/}
      {/*  </div>*/}
      {/*</NavbarMenu>*/}
    </header>
  );
}
