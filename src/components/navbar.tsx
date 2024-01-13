"use client";

import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon, McdrLogo, } from "@/components/icons";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import Link from "next/link";

import { useState } from 'react';
import { Container, Group, Burger, getThemeColor, useMantineTheme, alpha } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from './navbar.module.css';
import { IconExternalLink } from "@tabler/icons-react";
import { clsx } from "clsx";

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

const links = [
  { link: '/about', label: 'Features' },
  { link: '/pricing', label: 'Pricing' },
  { link: '/learn', label: 'Learn' },
  { link: '/community', label: 'Community' },
];

function HeaderSimple() {
  const [opened, { toggle }] = useDisclosure(false);
  const [active, setActive] = useState(links[0].link);

  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={classes.link}
      data-active={active === link.link || undefined}
      onClick={(event) => {
        event.preventDefault();
        setActive(link.link);
      }}
    >
      {link.label}
    </a>
  ));

  return (
    <header className={classes.header}>
      <Container size="md" className={classes.inner}>
        <McdrLogo size={28} />
        <Group gap={5} visibleFrom="xs">
          {items}
        </Group>

        <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
      </Container>
    </header>
  );
}

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
          <Link className="flex justify-start items-center gap-1" color="foreground" href="/">
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
