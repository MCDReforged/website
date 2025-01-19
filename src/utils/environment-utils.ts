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
