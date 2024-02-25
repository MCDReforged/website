import { Link } from "@/common/navigation";
import { clsx } from "clsx";
import React from "react";

interface NaLinkProps {
  className?: string
  href: string
  target?: string
  children?: React.ReactNode

  external?: boolean | 'auto'
  colored?: boolean
  hoverColor?: boolean
  hoverUnderline?: boolean

  [_: string]: any
}

export function NaLink({ className, href, target, children, external, colored, hoverColor, hoverUnderline, ...props }: NaLinkProps) {
  if (external === undefined) {
    external = 'auto'
  }
  if (typeof external === 'boolean' && external || typeof external === 'string' && external === 'auto' && !href?.startsWith('/')) {
    target = '_blank'
  }
  className = clsx(
    className,
    colored && 'text-mantine-primary-7',
    hoverColor && 'hover:text-mantine-primary-7',
    hoverUnderline && 'hover:underline',
  )
  return (
    <Link
      className={className}
      target={target}
      href={href}
      {...props}
    >
      {children}
    </Link>
  )
}
