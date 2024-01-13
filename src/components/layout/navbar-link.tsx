'use client'
import { Link, usePathname } from "@/i18n-utils";
import { IconExternalLink } from "@tabler/icons-react";
import { clsx } from "clsx";
import classes from './navbar.module.css';

export interface NavItem {
  label: string
  href: string
  isExternal: boolean
  checkActive: (pathname: string) => boolean
}

export function NavbarLink({item}: {item: NavItem}) {
  const pathname = usePathname();
  return (
    <Link
      className={clsx("text-md", classes.link)}
      href={item.href}
      data-active={item.checkActive(pathname) || undefined}
    >
      <div className="flex items-center">
        {item.label}
        {item.isExternal && <IconExternalLink size={20} strokeWidth={1.4} className="ml-1" />}
      </div>
    </Link>
  )
}