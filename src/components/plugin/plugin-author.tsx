import { AuthorInfo } from "@/catalogue/meta-types";
import { clsx } from "clsx";
import Link from "next/link";
import React from "react";

export function PluginAuthor({author, className}: {author: AuthorInfo, className: string}) {
  if (author === undefined) {
    return null
  }
  return (
    <Link href={author.link} className={clsx("hover:text-mantine-primary-7", className)}>
      {author.name}
    </Link>
  )
}

interface PluginAuthorListProps {
  authors: AuthorInfo[]
  wrap?: boolean
  textClassName?: string
  linkClassName?: string
}

export function PluginAuthorList({authors, wrap, textClassName, linkClassName}: PluginAuthorListProps) {
  return (
    <div className={clsx("flex flex-row", wrap ? "flex-wrap" : undefined)}>
      {authors.map((author, index) =>
        <div className="flex flex-row" key={index}>
          <PluginAuthor author={author} className={clsx(textClassName, linkClassName)}/>
          <p className={clsx("mr-1", textClassName)}>
            {index < authors.length - 1 && ','}
          </p>
        </div>
      )}
    </div>
  )
}
