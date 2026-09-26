export const PLUGIN_LABELS = ['information', 'tool', 'management', 'api', 'handler'] as const

export type PluginLabel = typeof PLUGIN_LABELS[number]

export const INTRODUCTION_LANGUAGES = ['en_us', 'zh_cn'] as const

export type IntroductionLanguage = typeof INTRODUCTION_LANGUAGES[number]

export interface PluginInfoAuthor {
  name: string
  link?: string
}

/** The submission form as sent by the browser. Everything here is untrusted. */
export interface SubmitForm {
  /** `owner/name` of the plugin repository */
  repo: string
  branch: string
  /** Directory containing `mcdreforged.plugin.json`, `.` for the repository root */
  relatedPath: string
  id: string
  authors: PluginInfoAuthor[]
  labels: string[]
  /** language -> file path inside the plugin repository */
  introduction: Record<string, string>
}

/** Content of `plugins/<id>/plugin_info.json` */
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

/**
 * A validation finding. `code` is translated on the client, `params` are interpolated into the message.
 */
export interface SubmitIssue {
  code: SubmitIssueCode
  params?: Record<string, string | number>
}

export interface ValidationResult {
  errors: SubmitIssue[]
  warnings: SubmitIssue[]
  pluginInfo: PluginInfoJson | null
  /** What the catalogue would end up showing for the submitted plugin, for the review step */
  report: SubmissionReport | null
}

/** Release that the catalogue will pick up for the plugin */
export interface ReleaseCheck {
  tag: string
  version: string
  url: string | null
  asset: string
}

/** Whether the repository declares an open source license, detected from the file tree (no extra API call) */
export interface LicenseCheck {
  detected: boolean
  files: string[]
}

/** The plugin's own `mcdreforged.plugin.json`, as shown in the report */
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
  /** authors as they will be written into plugin_info.json */
  authors: PluginInfoAuthor[]
  labels: string[]
  introduction: Record<string, string>
  license: LicenseCheck
  release: ReleaseCheck | null
  metadata: ReportMetadata | null
}

export interface PluginCandidate {
  relatedPath: string
  /** id / name / version / ... of the plugin declared by `mcdreforged.plugin.json` */
  metadata: {
    id?: string
    name?: string
    version?: string
    description?: string | Record<string, string>
    authors?: PluginInfoAuthor[]
    links?: { homepage?: string } | null
  }
  /** true when the declared id is usable as a plugin id */
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
  /** markdown files selectable as introduction source, shallow paths first */
  mdFiles: string[]
  treeTruncated: boolean
}

/**
 * The catalogue's contributing guidelines, fetched on the server and rendered inside the wizard
 * instead of linking away to GitHub.
 */
export interface Guidelines {
  markdown: string
  fileName: string
  /** base url used to rewrite relative links and images inside the document */
  baseUrl: string
}


/** Where the user's own fork of the catalogue stands */
export interface ForkStatus {
  login: string
  /** a file probe found the repository; a miss is unknown, not proof of absence */
  forkExists: boolean
  /** commits in the fork that the catalogue does not have; they ride along into the pull request */
  forkAheadBy: number
}
