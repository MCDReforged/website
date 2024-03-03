import { NaLink } from "@/components/na-link";
import { siteConfig } from "@/site/config";
import { clsx } from "clsx";
import React from "react";

export async function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className={clsx(
      "max-w-screen-xl w-full",
      "py-3 px-10 mx-auto",
    )}>
      <div className="flex flex-col sm:flex-row gap-x-20 gap-y-2 items-center justify-center *:text-sm">
        <div>
          <span className="mr-2">Copyright © {year}</span>
          <NaLink href="https://fallenbreath.me" hoverColor>Fallen_Breath</NaLink>
        </div>
        <div className="flex gap-5">
          <NaLink href={siteConfig.links.githubMcdr} hoverColor>MCDReforged</NaLink>
          <NaLink href={siteConfig.links.githubWebsite} hoverColor>Website source</NaLink>
        </div>
      </div>
    </footer>
  )
}
