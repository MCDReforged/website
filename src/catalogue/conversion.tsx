import { AllOfAPlugin, AuthorSummary, ReleaseInfo } from "./meta-types";
import { SimplePlugin, SimpleRelease } from "./simple-types";

export function createSimplePlugin(plugin: AllOfAPlugin, authorData: AuthorSummary): SimplePlugin {
  let downloads = 0
  let latestDate: Date | undefined = undefined
  plugin.release['releases'].forEach(r => {
    downloads += r.asset.download_count
    const date: Date = new Date(r.asset.created_at)
    if (latestDate === undefined || date > latestDate) {
      latestDate = date
    }
  })
  const latestRelease = plugin.release.releases[plugin.release.latest_version_index ?? -1]
  const latestSimpleRelease: SimpleRelease | undefined = latestRelease === undefined ? undefined : createSimpleRelease(latestRelease)

  const repos = plugin.plugin.repository.replace(/\/$/, '')
  const authors = plugin.plugin.authors
    .map((a) => authorData.authors[a])
    .filter((a) => a !== undefined)
  return {
    id: plugin.plugin.id,
    name: plugin.meta.name,
    version: plugin.meta.version,
    description: plugin.meta.description,
    repos: repos,
    reposHome: `${repos}/tree/${plugin.plugin.branch}` + (plugin.plugin.related_path !== '.' ? `/${plugin.plugin.related_path}` : ''),
    labels: plugin.plugin.labels,
    authors: authors,
    downloads: downloads,
    recentUpdated: latestDate,
    latestRelease: latestSimpleRelease,
  }
}

export function createSimpleRelease(release: ReleaseInfo): SimpleRelease {
  return {
    version: release.meta.version,
    url: release.url,
    assetName: release.asset.name,
    assetUrl: release.asset.browser_download_url,
  }
}
