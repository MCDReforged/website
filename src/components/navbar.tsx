"use client";

import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@nextui-org/navbar";
import { Kbd } from "@nextui-org/kbd";
import { Link } from "@nextui-org/link";
import { isAppleDevice } from "@react-aria/utils";

import { link as linkStyles } from "@nextui-org/theme";

import clsx from "clsx";

import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon, McdrLogo, SearchIcon, } from "@/components/icons";
import { usePathname } from "next/navigation";
import { siteConfig } from "../config/site";
import { Button } from "@nextui-org/button";

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

const handleOpenSearch = () => {
};

export const Navbar = () => {
  const searchInput = (
    <Button
      aria-label="Search"
      className="text-sm text-default-500 bg-default-400/20 dark:bg-default-500/20"
      endContent={
        <Kbd className="hidden md:inline-block" keys={[isAppleDevice() ? "command" : "ctrl"]}>
          K
        </Kbd>
      }
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      onPress={handleOpenSearch}
    >
      Search...
    </Button>
  );

  const pathname = usePathname();
  return (
    <NextUINavbar maxWidth="xl" position="sticky" isBordered>
      <NavbarBrand className="gap-3 max-w-fit">
        <Link className="flex justify-start items-center gap-1" color="foreground" href="/">
          <McdrLogo size={36} />
          <p className="font-bold text-inherit">MCDReforged</p>
        </Link>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4 justify-start ml-2" justify="start">
        {config.navItems.map((item) => (
          <NavbarItem key={item.href} as="li">
            <Link
              className={clsx(
                linkStyles({ color: "foreground" }),
                "data-[active=true]:text-primary data-[active=true]:font-medium"
              )}
              data-active={item.checkActive(pathname)}
              href={item.href}
              isExternal={item.isExternal}
              showAnchorIcon={item.isExternal}
            >
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent className="basis-1 pl-4" justify="end">
        <Link isExternal href={siteConfig.links.github} aria-label="Github">
          <GithubIcon className="text-default-500" />
        </Link>
        <ThemeSwitch />
        {/*<NavbarItem className="hidden sm:flex">{searchInput}</NavbarItem>*/}
        <NavbarMenuToggle className="sm:hidden" />
      </NavbarContent>

      <NavbarMenu>
        {/*{searchInput}*/}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {config.navItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};
