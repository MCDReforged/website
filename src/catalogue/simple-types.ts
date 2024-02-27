import { AuthorInfo, AuthorSummary, LangDict } from "@/catalogue/meta-types";

export interface SimpleEverything {
  timestamp: number
  authors: AuthorSummary
  plugins: {
    [key: string]: SimplePlugin
  }
}

export interface SimplePlugin {
  id: string
  name: string
  description: LangDict
  repos: string
  reposHome: string
  labels: string[]
  authors: AuthorInfo[]
  downloads: number
  recentUpdated: Date | undefined
  latestRelease: SimpleRelease | undefined
}

export interface SimpleRelease {
  version: string
  url: string
  assetName: string
  assetUrl: string
}

