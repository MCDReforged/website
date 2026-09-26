export function isProduction() {
  return process.env.NODE_ENV === 'production'
}

export function shouldReadCatalogueEverythingFromLocalFile() {
  return process.env.MW_USE_LOCAL_EVERYTHING === 'true'
}

export function getCatalogueEverythingUrl() {
  return process.env.MW_EVERYTHING_JSON_URL || 'https://raw.githubusercontent.com/MCDReforged/PluginCatalogue/meta/everything.json.gz'
}

export function getRevalidateCatalogueToken() {
  return process.env.MW_REVALIDATE_CATALOGUE_TOKEN
}

export function getTelemetryApiToken() {
  return process.env.MW_TELEMETRY_API_TOKEN || ''
}

// ---- Plugin submission / GitHub OAuth ---- //

export function getGithubOAuthClientId() {
  return process.env.MW_GITHUB_OAUTH_CLIENT_ID
}

export function getGithubOAuthClientSecret() {
  return process.env.MW_GITHUB_OAUTH_CLIENT_SECRET
}

export function getSessionSecret() {
  return process.env.MW_SESSION_SECRET
}

/** The catalogue repository that submissions are opened against, e.g. `MCDReforged/PluginCatalogue` */
export function getCatalogueRepo() {
  return process.env.MW_CATALOGUE_REPO || 'MCDReforged/PluginCatalogue'
}

export function getGithubApiBase() {
  return process.env.MW_GITHUB_API_BASE || 'https://api.github.com'
}

/** Set to `true` to disable the plugin submission feature; the submit page then shows a notice. */
export function isPluginSubmissionEnabled() {
  return process.env.MW_DISABLE_PLUGIN_SUBMISSION !== 'true'
}

/**
 * Public base url of this website, used to build the OAuth `redirect_uri`.
 * Falls back to the request origin, which is usually correct behind a reverse proxy.
 */
export function getSiteBaseUrl(fallback: string) {
  return (process.env.MW_SITE_BASE_URL || fallback).replace(/\/+$/, '')
}
