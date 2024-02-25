export function locationHome() {
  return '/'
}

export function locPluginCatalogue() {
  return '/plugins'
}

export function locPlugin(pluginId: string) {
  return locPluginCatalogue() + '/p/' + pluginId
}

export function locPluginIntroduction(pluginId: string) {
  return locPlugin(pluginId) + '/introduction'
}

export function locPluginReadme(pluginId: string) {
  return locPlugin(pluginId) + '/readme'
}

export function locPluginReleases(pluginId: string) {
  return locPlugin(pluginId) + '/releases'
}

export function locPluginDependencies(pluginId: string) {
  return locPlugin(pluginId) + '/dependencies'
}

export function locPluginRelease(pluginId: string, version: string) {
  return locPlugin(pluginId) + '/release/' + version
}
