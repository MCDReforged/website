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
  repos: string  // https://github.com/foo/bar
  reposHome: string // https://github.com/foo/bar/tree/master/src
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

