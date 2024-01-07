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
import {Kbd} from "@nextui-org/kbd";
import {Link} from "@nextui-org/link";
import {Input} from "@nextui-org/input";

import {link as linkStyles} from "@nextui-org/theme";

import clsx from "clsx";

import {ThemeSwitch} from "@/components/theme-switch";
import {GithubIcon, McdrLogo, SearchIcon,} from "@/components/icons";
import {usePathname} from "next/navigation";
import {siteConfig} from "../config/site";

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
      checkActive: (pathname: string) => pathname === "/plugins" || pathname.startsWith("/plugin/"),
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
  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden md:inline-block" keys={["ctrl"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  const pathname = usePathname();
  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarBrand className="gap-3 max-w-fit">
        <Link className="flex justify-start items-center gap-1" color="foreground" href="/">
          <McdrLogo />
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
        <NavbarItem className="hidden sm:flex">{searchInput}</NavbarItem>
        <NavbarMenuToggle className="sm:hidden" />
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
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
