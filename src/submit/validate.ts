import { GithubApiError, GithubGitTree, GithubRelease, githubRequest } from '@/utils/github-api'

import { isSafeRelatedPath, normalizeRelatedPath, resolvePluginRelative } from '@/utils/plugin-path-utils'
import { parseReleaseTagVersion } from '@/utils/plugin-version-utils'
import { closestId } from './levenshtein'
import {
  asString,
  getDescriptionText,
  getPluginId,
  isValidPluginId,
  PLUGIN_ID_RECOMMENDED_MIN_LENGTH,
  RawPluginMetadata,
} from './metadata'
import { fetchTree, readPluginMetadata, splitRepo } from './repo'
import { firstExistingRawFile, rawFileExists, readRawFile } from '@/utils/github-raw'
import {
  INTRODUCTION_LANGUAGES,
  LicenseCheck,
  PLUGIN_LABELS,
  PluginInfoAuthor,
  PluginInfoJson,
  ReleaseCheck,
  ReportMetadata,
  SubmissionReport,
  SubmitForm,
  SubmitIssue,
  ValidationResult,
} from './types'

/** The catalogue warns when the id is closer than this to an existing one. */
const ID_SIMILARITY_THRESHOLD = 3

/**
 * Mirrors the catalogue's release rules: a release is usable when it is not a pre-release, its tag
 * parses as a version for this plugin id, and it carries a `.mcdr` or `.pyz` asset. The catalogue
 * does not require the tag to match the current metadata version, so neither do we; a matching
 * release simply has to exist.
 */
const RELEASE_SCAN_LIMIT = 100

/** `LICENSE`, `LICENSE.md`, `LICENSE-MIT`, `COPYING`, `LICENCE` ... at the repository root. */
const LICENSE_FILE_REGEX = /^(licen[cs]e|copying)([-.].*)?$/i

/**
 * The catalogue asks for a fresh id list on the default branch. Omitting `ref` makes the contents
 * API use the repository's default branch, which saves a `GET /repos/{repo}` round trip.
 */
export async function fetchExistingPluginIds(upstream: string): Promise<string[]> {
  try {
    const entries = await githubRequest<{ name: string, type: string }[]>(`/repos/${upstream}/contents/plugins`)
    return entries.filter(entry => entry.type === 'dir').map(entry => entry.name)
  } catch (error) {
    // a catalogue without a plugins directory has nothing to collide with; the catalogue's own
    // check remains the authority on duplicate ids, so this must not block a submission
    if (error instanceof GithubApiError && error.status === 404) {
      return []
    }
    throw error
  }
}

function normalizeIntroduction(introduction: Record<string, string> | undefined): Record<string, string> {
  const result: Record<string, string> = {}
  for (const language of INTRODUCTION_LANGUAGES) {
    const value = introduction?.[language]
    if (typeof value === 'string' && value.trim().length > 0) {
      result[language] = value.trim().replace(/^\/+/, '')
    }
  }
  return result
}

function normalizeAuthorsInput(authors: PluginInfoAuthor[] | undefined): { authors: PluginInfoAuthor[], invalidIndexes: number[] } {
  const invalidIndexes: number[] = []
  const result: PluginInfoAuthor[] = []
  for (let i = 0; i < (authors ?? []).length; i++) {
    const item = authors![i]
    const name = typeof item?.name === 'string' ? item.name.trim() : ''
    if (name.length === 0) {
      invalidIndexes.push(i + 1)
      continue
    }
    const link = typeof item?.link === 'string' ? item.link.trim() : ''
    result.push(link.length > 0 ? { name, link } : { name })
  }
  return { authors: result, invalidIndexes }
}

function detectLicense(tree: GithubGitTree): LicenseCheck {
  const files = tree.tree
    .filter(entry => entry.type === 'blob')
    .map(entry => entry.path)
    .filter(path => !path.includes('/'))  // a repository level license, like the catalogue detects
    .filter(path => LICENSE_FILE_REGEX.test(path))
  return { detected: files.length > 0, files }
}

function matchRelease(releases: GithubRelease[], id: string): ReleaseCheck | null {
  for (const release of releases) {
    if (release.draft || release.prerelease) {
      continue
    }
    const version = parseReleaseTagVersion(release.tag_name, id)
    if (version === null) {
      continue
    }
    const asset = release.assets.find(item => /\.(mcdr|pyz)$/i.test(item.name))
    if (asset === undefined) {
      continue
    }
    return { tag: release.tag_name, version, url: release.html_url ?? null, asset: asset.name }
  }
  return null
}

/** Reads the release list once; no release can match when the plugin declares no version at all. */
async function findRelease(repo: string, id: string, version: string | undefined): Promise<ReleaseCheck | null> {
  if (!version) {
    return null
  }
  const releases = await githubRequest<GithubRelease[]>(`/repos/${repo}/releases`, {
    query: { per_page: RELEASE_SCAN_LIMIT },
  })
  return matchRelease(releases, id)
}

function buildMetadataReport(metadata: RawPluginMetadata): ReportMetadata {
  const dependencies: Record<string, string> = {}
  if (metadata.dependencies !== null && typeof metadata.dependencies === 'object') {
    for (const [key, value] of Object.entries(metadata.dependencies as Record<string, unknown>)) {
      const requirement = asString(value)
      if (requirement !== undefined) {
        dependencies[key] = requirement
      }
    }
  }

  const authors: string[] = []
  const rawAuthors = metadata.authors !== undefined ? metadata.authors : metadata.author
  for (const item of Array.isArray(rawAuthors) ? rawAuthors : rawAuthors === undefined ? [] : [rawAuthors]) {
    const name = typeof item === 'string'
      ? item.trim()
      : item !== null && typeof item === 'object'
        ? asString((item as Record<string, unknown>).name)
        : undefined
    if (name !== undefined && name.length > 0) {
      authors.push(name)
    }
  }

  return {
    id: getPluginId(metadata) ?? asString(metadata.id),
    name: asString(metadata.name),
    version: asString(metadata.version),
    description: (metadata.description ?? undefined) as string | Record<string, string> | undefined,
    authors,
    dependencies,
    homepage: asString(metadata.links?.homepage),
  }
}

interface LocalChecks {
  errors: SubmitIssue[]
  warnings: SubmitIssue[]
  /** `owner/name`, or `null` when the form does not name a repository */
  repo: string | null
  id: string
  branch: string
  relatedPath: string
  relatedPathIsSafe: boolean
  introduction: Record<string, string>
  labels: string[]
  authors: PluginInfoAuthor[]
}

/** Everything that can be judged from the form alone, with no request at all. */
function collectLocalIssues(form: SubmitForm): LocalChecks {
  const errors: SubmitIssue[] = []
  const warnings: SubmitIssue[] = []

  const repoParts = splitRepo(form.repo ?? '')
  const id = (form.id ?? '').trim()
  const relatedPath = normalizeRelatedPath(form.relatedPath)
  const branch = (form.branch ?? '').trim()
  const introduction = normalizeIntroduction(form.introduction)
  const labels = Array.isArray(form.labels) ? form.labels : []
  const { authors, invalidIndexes } = normalizeAuthorsInput(form.authors)

  const relatedPathIsSafe = isSafeRelatedPath(relatedPath)
  if (repoParts === null) {
    errors.push({ code: 'repo_invalid' })
  }
  if (!relatedPathIsSafe) {
    errors.push({ code: 'related_path_invalid', params: { path: relatedPath } })
  }
  if (!isValidPluginId(id)) {
    errors.push({ code: 'id_invalid', params: { id } })
  } else if (id.length < PLUGIN_ID_RECOMMENDED_MIN_LENGTH) {
    warnings.push({ code: 'id_too_short', params: { id } })
  }
  if (invalidIndexes.length > 0) {
    errors.push({ code: 'authors_invalid', params: { indexes: invalidIndexes.join(', ') } })
  } else if (authors.length === 0) {
    warnings.push({ code: 'authors_missing' })
  }
  for (const label of labels) {
    if (!(PLUGIN_LABELS as readonly string[]).includes(label)) {
      errors.push({ code: 'label_invalid', params: { label } })
    }
  }
  if (labels.length === 0) {
    warnings.push({ code: 'labels_missing' })
  }
  if (Object.keys(introduction).length === 0) {
    errors.push({ code: 'introduction_missing' })
  }

  return {
    errors,
    warnings,
    repo: repoParts === null ? null : repoParts.join('/'),
    id,
    branch,
    relatedPath,
    relatedPathIsSafe,
    introduction,
    labels,
    authors,
  }
}

export async function validateSubmission(form: SubmitForm, catalogueRepo: string): Promise<ValidationResult> {
  const local = collectLocalIssues(form)
  const { errors, warnings, repo, id, branch, relatedPath, introduction, labels, authors } = local

  if (repo === null) {
    return { errors, warnings, pluginInfo: null, report: null }
  }
  if (!local.relatedPathIsSafe) {
    // every remaining check resolves files under this path, none of them can be meaningful
    return { errors, warnings, pluginInfo: null, report: null }
  }

  // ---- catalogue uniqueness (1 API call) ---- //
  const existingIds = await fetchExistingPluginIds(catalogueRepo)
  if (errors.every(issue => issue.code !== 'id_invalid')) {
    if (existingIds.includes(id)) {
      errors.push({ code: 'id_exists', params: { id } })
    } else {
      const closest = closestId(id, existingIds)
      if (closest !== null && closest.distance < ID_SIMILARITY_THRESHOLD) {
        warnings.push({ code: 'id_similar', params: { existing: closest.id, distance: closest.distance } })
      }
    }
  }

  // ---- repository tree (1 API call) ---- //
  let tree: GithubGitTree
  try {
    tree = await fetchTree(repo, branch)
  } catch (error) {
    if (error instanceof GithubApiError && error.status === 404) {
      errors.push({ code: 'branch_not_found', params: { branch } })
      return { errors, warnings, pluginInfo: null, report: null }
    }
    throw error
  }

  const license = detectLicense(tree)
  if (!license.detected) {
    warnings.push({ code: 'no_license' })
  }

  const blobs = new Set(tree.tree.filter(entry => entry.type === 'blob').map(entry => entry.path))
  const pluginJsonPath = relatedPath === '.' ? 'mcdreforged.plugin.json' : `${relatedPath}/mcdreforged.plugin.json`

  // ---- plugin metadata (1 API call) ---- //
  let metadata: RawPluginMetadata | null = null
  if (!blobs.has(pluginJsonPath)) {
    errors.push({ code: 'plugin_json_missing', params: { path: pluginJsonPath } })
  } else {
    const parsed = await readPluginMetadata(repo, branch, pluginJsonPath)
    if (parsed === null) {
      errors.push({ code: 'plugin_json_unreadable', params: { path: pluginJsonPath } })
    } else {
      metadata = parsed
      const declaredId = getPluginId(parsed)
      if (declaredId === null) {
        errors.push({ code: 'id_invalid', params: { id: String(parsed.id ?? '') } })
      } else if (declaredId !== id) {
        errors.push({ code: 'id_mismatch', params: { expected: declaredId, actual: id } })
      }
      if (getDescriptionText(parsed) === undefined) {
        errors.push({ code: 'description_missing', params: { path: pluginJsonPath } })
      }
    }
  }

  for (const [language, path] of Object.entries(introduction)) {
    // `introduction` is relative to `related_path` in the catalogue, and may walk out of it
    const resolved = resolvePluginRelative(relatedPath, path)
    if (resolved === null || !blobs.has(resolved)) {
      errors.push({ code: 'introduction_path_not_found', params: { language, path } })
    }
  }

  // ---- releases (1 API call, skipped when no version is known) ---- //
  const version = metadata === null ? undefined : asString(metadata.version)
  const release = await findRelease(repo, id, version)
  if (metadata !== null && release === null) {
    warnings.push({ code: 'no_release' })
  }

  const report: SubmissionReport = {
    repo,
    repository: `https://github.com/${repo}`,
    branch,
    relatedPath,
    pluginJsonPath,
    authors,
    labels,
    introduction,
    license,
    release,
    metadata: metadata === null ? null : buildMetadataReport(metadata),
  }

  const pluginInfo: PluginInfoJson | null = errors.length === 0 ? buildPluginInfo(form) : null

  return { errors, warnings, pluginInfo, report }
}


/** Licence file names worth probing when the repository tree cannot be listed. */
const LICENSE_PROBE_NAMES = [
  'LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENSE.rst',
  'LICENCE', 'LICENCE.md', 'LICENCE.txt',
  'COPYING', 'COPYING.md', 'COPYING.LESSER',
]

/**
 * The same submission, checked from the repository files alone.
 *
 * `raw.githubusercontent.com` has no request quota, so everything with a *known* path can still be
 * checked when the API is unavailable: the plugin metadata, the introduction files, the licence and
 * whether the id is already taken. What needs the API is left out — the release lookup, the
 * repository tree (so no plugin directory suggestions and no similar id warning) — and the result
 * says so, through the `release_unchecked` warning.
 */
export async function validateWithoutApi(form: SubmitForm, catalogueRepo: string): Promise<ValidationResult> {
  const local = collectLocalIssues(form)
  const { errors, warnings, repo, id, branch, relatedPath, introduction, labels, authors } = local

  if (repo === null || !local.relatedPathIsSafe) {
    return { errors, warnings, pluginInfo: null, report: null }
  }

  const pluginJsonPath = relatedPath === '.' ? 'mcdreforged.plugin.json' : `${relatedPath}/mcdreforged.plugin.json`

  // ---- plugin metadata (1 file) ---- //
  let metadata: RawPluginMetadata | null = null
  const rawMetadata = await readRawFile(repo, branch, pluginJsonPath)
  if (rawMetadata === null) {
    errors.push({ code: 'plugin_json_missing', params: { path: pluginJsonPath } })
  } else {
    try {
      metadata = JSON.parse(rawMetadata) as RawPluginMetadata
    } catch {
      errors.push({ code: 'plugin_json_unreadable', params: { path: pluginJsonPath } })
    }
  }
  if (metadata !== null) {
    const declaredId = getPluginId(metadata)
    if (declaredId === null) {
      errors.push({ code: 'id_invalid', params: { id: String(metadata.id ?? '') } })
    } else if (declaredId !== id) {
      errors.push({ code: 'id_mismatch', params: { expected: declaredId, actual: id } })
    }
    if (getDescriptionText(metadata) === undefined) {
      errors.push({ code: 'description_missing', params: { path: pluginJsonPath } })
    }
  }

  // ---- introduction files (1 file each) ---- //
  for (const [language, path] of Object.entries(introduction)) {
    const resolved = resolvePluginRelative(relatedPath, path)
    if (resolved === null || !(await rawFileExists(repo, branch, resolved))) {
      errors.push({ code: 'introduction_path_not_found', params: { language, path } })
    }
  }

  // ---- licence (a few probes at the repository root) ---- //
  const licenceFile = await firstExistingRawFile(repo, branch, LICENSE_PROBE_NAMES)
  const license: LicenseCheck = { detected: licenceFile !== null, files: licenceFile === null ? [] : [licenceFile] }
  if (!license.detected) {
    warnings.push({ code: 'no_license' })
  }

  // ---- is the id free? (1 file, instead of listing the catalogue) ---- //
  if (errors.every(issue => issue.code !== 'id_invalid')) {
    if (await rawFileExists(catalogueRepo, 'HEAD', `plugins/${id}/plugin_info.json`)) {
      errors.push({ code: 'id_exists', params: { id } })
    }
  }

  // the release lookup and the tree scan need the API; saying nothing would read as "all clear"
  warnings.push({ code: 'release_unchecked' })

  const report: SubmissionReport = {
    repo,
    repository: `https://github.com/${repo}`,
    branch,
    relatedPath,
    pluginJsonPath,
    authors,
    labels,
    introduction,
    license,
    release: null,
    metadata: metadata === null ? null : buildMetadataReport(metadata),
  }

  return {
    errors,
    warnings,
    pluginInfo: errors.length === 0 ? buildPluginInfo(form) : null,
    report,
  }
}

/**
 * The `plugin_info.json` a form describes, with nothing checked.
 *
 * The wizard falls back to this when the checks cannot run at all — a used up anonymous quota, or
 * a repository that cannot be read — because submitting needs no API access: the file is created on
 * github.com, and the catalogue runs its own checks on the pull request.
 */
export function buildPluginInfo(form: SubmitForm): PluginInfoJson | null {
  const repoParts = splitRepo(form.repo ?? '')
  const id = (form.id ?? '').trim()
  if (repoParts === null || id.length === 0) {
    return null
  }
  return {
    id,
    authors: normalizeAuthorsInput(form.authors).authors,
    repository: `https://github.com/${repoParts.join('/')}`,
    branch: (form.branch ?? '').trim(),
    related_path: normalizeRelatedPath(form.relatedPath),
    labels: Array.isArray(form.labels) ? form.labels : [],
    introduction: normalizeIntroduction(form.introduction),
  }
}
