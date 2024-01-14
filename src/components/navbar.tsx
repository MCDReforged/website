"use client";

import { GithubIcon, McdrLogo, } from "@/components/icons";

import { ThemeSwitch } from "@/components/theme-switch";
import { Link } from "@nextui-org/link";
import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@nextui-org/navbar";

import { link as linkStyles } from "@nextui-org/theme";

import clsx from "clsx";
import { usePathname } from "next/navigation";
import { siteConfig } from "../config/site";

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
  const linkStyle = clsx(
    linkStyles({ color: "foreground" }),
    "data-[active=true]:text-primary data-[active=true]:font-medium"
  )
  return (
    <NextUINavbar maxWidth="xl" position="sticky" isBordered>
      <NavbarBrand className="gap-3 max-w-fit">
        <Link className="flex justify-start items-center gap-1" color="foreground" href="/">
          <McdrLogo size={36} />
          <p className="font-bold text-inherit">MCDReforged</p>
        </Link>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4 justify-start ml-2">
        {config.navItems.map((item) => (
          <NavbarItem key={item.href} as="li">
            <Link
              className={linkStyle}
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
        <NavbarMenuToggle className="sm:hidden" />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {config.navItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                className={linkStyle}
                data-active={item.checkActive(pathname)}
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
