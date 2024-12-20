import { NaLink } from "@/components/na-link";
import { siteConfig } from "@/site/config";
import { getGitInfo } from "@/utils/git-info";
import { clsx } from "clsx";
import React from "react";

export async function Footer() {
  const year = new Date().getFullYear()
  const gitInfo = await getGitInfo()
  const gitBranchUrl = gitInfo && `${siteConfig.links.githubWebsite}/tree/${gitInfo.branch}`
  const gitCommitUrl = gitInfo && `${siteConfig.links.githubWebsite}/tree/${gitInfo.commitHash}`
  return (
    <footer className={clsx(
      "max-w-screen-xl w-full",
      "py-3 px-10 mx-auto",
    )}>
      <div className="flex flex-col md:flex-row gap-x-20 gap-y-2 items-center justify-center *:text-sm">
        <div>
          <span className="mr-2">Copyright © {year}</span>
          <NaLink href="https://fallenbreath.me" hoverColor>Fallen_Breath</NaLink>
        </div>
        <div className="flex gap-5">
          <NaLink href={siteConfig.links.githubMcdr} hoverColor>MCDReforged</NaLink>
          <NaLink href={siteConfig.links.githubWebsite} hoverColor>Website source</NaLink>
          {gitInfo &&
            <p>
              <NaLink href={gitBranchUrl!} hoverColor>{gitInfo.branch}</NaLink>
              <span>@</span>
              <NaLink href={gitCommitUrl!} hoverColor>{gitInfo.commitHash.slice(0, 8)}</NaLink>
            </p>}
        </div>
      </div>
    </footer>
  )
}
