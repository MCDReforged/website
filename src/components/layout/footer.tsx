import { siteConfig } from "@/config/site";
import { clsx } from "clsx";
import Link from "next/link";
import React from "react";

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className={clsx(
      "max-w-screen-xl w-full",
      "py-3 px-10 mx-auto",
    )}>
      <div className="flex flex-col sm:flex-row gap-x-20 gap-y-2 items-center justify-center *:text-sm">
        <div>
          <span className="mr-2">Copyright © {year}</span>
          <Link target="_blank" href="https://fallenbreath.me">Fallen_Breath</Link>
        </div>
        <div className="flex flex-row gap-5">
          <Link href={siteConfig.links.github} target="_blank">GitHub</Link>
          <Link href={siteConfig.links.githubWebsite} target="_blank">Source code</Link>
        </div>
      </div>
    </footer>
  )
}
