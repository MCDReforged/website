import { LangDict, ReleaseInfo } from "@/catalogue/types";

export interface SimplePlugin {
  id: string
  name: string
  version: string
  description: LangDict
  repository: string
  labels: string[]
  authors: string[]
  downloads: number
  recentUpdated: string | undefined
  recentUpdatedTime: number
  latestVersion: string | undefined
  latestRelease: ReleaseInfo | undefined
}
