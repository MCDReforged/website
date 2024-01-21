// https://github.com/MCDReforged/PluginCatalogue/tree/catalogue

export interface LangDict {
  [lang: string]: string
}

export interface Everything {
  timestamp: number
  authors: AuthorSummary
  plugins: {
    [key: string]: AllOfAPlugin
  }
}

export interface AuthorInfo {
  name: string
  link: string
}

export interface AuthorSummary {
  amount: number
  authors: {
    [key: string]: AuthorInfo
  }
}

export interface AllOfAPlugin {
  timestamp: number
  meta: MetaInfo
  plugin: PluginInfo
  release: ReleaseSummary
  repository: RepositoryInfo
}

export interface MetaInfo {
  id: string
  name: string
  version: string
  repository: string
  link: string
  authors: string[]

  dependencies: {[key: string]: string}
  requirements: string[]
  description: LangDict
}

export interface PluginInfo {
  id: string
  authors: string[]
  repository: string
  branch: string
  related_path: string
  labels: string[]
  introduction: LangDict
}

export interface ReleaseSummary {
  id: string
  latest_version: string | null
  latest_version_index: number | null
  releases: ReleaseInfo[]
}

export interface ReleaseInfo {
  url: string
  name: string
  tag_name: string
  created_at: string

  description: string | null
  prerelease: string

  asset: AssetInfo
  meta: MetaInfo
}

export interface AssetInfo {
  name: string
  size: number
  download_count: number
  created_at: string
  browser_download_url: string
}

export interface RepositoryInfo {
	timestamp: number

	url: string
	name: string
	full_name: string
	description: string | null
	archived: boolean

	stargazers_count: number
	watchers_count: number
	forks_count: number

	readme: string | null
}
