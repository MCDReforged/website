import { AuthorInfo } from "@/catalogue/meta-types";
import { NaLink } from "@/components/na-link";
import { clsx } from "clsx";
import React from "react";

export function PluginAuthor({author, className}: {author: AuthorInfo, className: string}) {
  if (author === undefined) {
    return null
  }
  return (
    <NaLink href={author.link} className={className} hoverColor>
      {author.name}
    </NaLink>
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
    <div className={clsx("flex flex-row", wrap && "flex-wrap")}>
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
