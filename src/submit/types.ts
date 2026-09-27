export const PLUGIN_LABELS = ['information', 'tool', 'management', 'api', 'handler'] as const

export type PluginLabel = typeof PLUGIN_LABELS[number]

export const INTRODUCTION_LANGUAGES = ['en_us', 'zh_cn'] as const

export interface PluginInfoAuthor {
  name: string
  link?: string
}

export interface SubmitForm {
  repo: string
  branch: string
  relatedPath: string
  id: string
  authors: PluginInfoAuthor[]
  labels: string[]
  introduction: Record<string, string>
}

export interface PluginInfoJson {
  id: string
  authors: PluginInfoAuthor[]
  repository: string
  branch: string
  related_path: string
  labels: string[]
  introduction: Record<string, string>
}

export type SubmitIssueCode =
  | 'id_invalid'
  | 'id_exists'
  | 'id_mismatch'
  | 'id_too_short'
  | 'id_similar'
  | 'repo_invalid'
  | 'related_path_invalid'
  | 'branch_not_found'
  | 'plugin_json_missing'
  | 'plugin_json_unreadable'
  | 'description_missing'
  | 'introduction_missing'
  | 'introduction_path_not_found'
  | 'label_invalid'
  | 'labels_missing'
  | 'authors_invalid'
  | 'authors_missing'
  | 'no_license'
  | 'no_release'
  | 'release_unchecked'
  | 'files_unchecked'

export interface SubmitIssue {
  code: SubmitIssueCode
  params?: Record<string, string | number>
}

export interface ValidationResult {
  errors: SubmitIssue[]
  warnings: SubmitIssue[]
  pluginInfo: PluginInfoJson | null
  report: SubmissionReport | null
}

export interface ReleaseCheck {
  tag: string
  version: string
  url: string | null
  asset: string
}

export interface LicenseCheck {
  detected: boolean
  files: string[]
}

export interface ReportMetadata {
  id?: string
  name?: string
  version?: string
  description?: string | Record<string, string>
  authors: string[]
  dependencies: Record<string, string>
  homepage?: string
}

export interface SubmissionReport {
  repo: string
  repository: string
  branch: string
  relatedPath: string
  pluginJsonPath: string
  authors: PluginInfoAuthor[]
  labels: string[]
  introduction: Record<string, string>
  license: LicenseCheck
  release: ReleaseCheck | null
  metadata: ReportMetadata | null
}

export interface PluginCandidate {
  relatedPath: string
  metadata: {
    id?: string
    name?: string
    version?: string
    description?: string | Record<string, string>
    authors?: PluginInfoAuthor[]
    links?: { homepage?: string } | null
  }
  validId: boolean
  error?: string
}

export interface RepoDetail {
  repo: string
  defaultBranch: string
  branch: string
  branches: string[]
  candidates: PluginCandidate[]
  candidatesTruncated: boolean
  mdFiles: string[]
  treeTruncated: boolean
}

export interface Guidelines {
  markdown: string
  fileName: string
  baseUrl: string
}

export interface ForkStatus {
  login: string
  forkExists: boolean
  forkAheadBy: number
}
