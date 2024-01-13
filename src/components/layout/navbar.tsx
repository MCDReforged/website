"use client";

import { GithubIcon, McdrLogo, } from "@/components/icons";
import { ThemeSwitch } from "@/components/ui/theme-switch";
import { siteConfig } from "@/config/site";
import { Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconExternalLink } from "@tabler/icons-react";
import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import classes from './navbar.module.css';

const config = {
  navItems: [
    {
      label: "Home",
      href: "/",
      isExternal: false,
      checkActive: (pathname: string) => pathname === '/',
    },
    {
      label: "Plugins",
      href: "/plugins",
      isExternal: false,
      checkActive: (pathname: string) => pathname === "/plugins" || pathname.startsWith("/plugins/"),
    },
    {
      label: "Docs",
      href: siteConfig.links.docs,
      isExternal: true,
      checkActive: (pathname: string) => false,
    },
  ],
};

export const Navbar = () => {
  const pathname = usePathname();
  const [burgerOpened, setBurgerOpened ] = useDisclosure(false);

  return (
    <header
      className={clsx(
        "z-40 flex sticky h-auto items-center justify-center top-0 border-solid border-b",
        classes.header,
      )}
    >
      <div className="z-40 flex flex-row flex-nowrap items-center justify-between max-w-screen-xl gap-6 px-6 w-full h-[3.5rem]">
        <div className="gap-3 max-w-fit">
          <Link className="flex justify-start items-center gap-1" color="foreground" href="/public">
            <McdrLogo size={36}/>
            <p className="font-bold text-inherit">MCDReforged</p>
          </Link>
        </div>

        <div className="hidden sm:flex gap-4 justify-start ml-2 flex-grow">
          {config.navItems.map((item) => (
            <Link
              className={clsx("text-md", classes.link)}
              key={item.href}
              href={item.href}
              data-active={item.checkActive(pathname) || undefined}
            >
              <div className="flex items-center">
                {item.label}
                {item.isExternal && <IconExternalLink size={20} strokeWidth={1.4} className="ml-1" />}
              </div>
            </Link>
          ))}
        </div>

        <div className="pl-4 justify-end flex flex-grow items-center">
          <Link target="_blank" href={siteConfig.links.github} aria-label="Github">
            <GithubIcon className="text-default-500"/>
          </Link>
          <ThemeSwitch className="mx-3"/>
          {/*<NavbarItem className="hidden sm:flex">{searchInput}</NavbarItem>*/}
          {/*<NavbarMenuToggle className="sm:hidden" />*/}
          <Burger opened={burgerOpened} onClick={setBurgerOpened.toggle} hiddenFrom="xs" size="sm" />
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
};
