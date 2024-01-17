import { AllOfAPlugin, Everything } from "@/catalogue/meta-types";
import { SimpleEverything, SimpleRelease } from "@/catalogue/simple-types";
import fs from 'fs/promises'
import path from "path";

const fetchInit = {
  next: {
    revalidate: 3 * 60  // ISR 3min
  }
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath)
    return true
  } catch (error) {
    return false
  }
}

async function devReadEverything(): Promise<Everything | null> {
  if (process.env.NODE_ENV === 'development' || process.env.USE_LOCAL_EVERYTHING === 'true') {
    const localDataPath = path.join(process.cwd(), 'src', 'catalogue', 'everything.json')
    if (await fileExists(localDataPath)) {
      const content = await fs.readFile(localDataPath, 'utf8')
      return JSON.parse(content) as any as Everything
    }
  }
  return null
}

export async function getEverything(): Promise<Everything> {
  const e = await devReadEverything()
  if (e !== null) {
    return e
  } else {
    const url: string = 'https://raw.githubusercontent.com/MCDReforged/PluginCatalogue/meta/everything.json'
    const res = await fetch(url, fetchInit)
    return await res.json() as any as Everything
  }
}

export async function getPlugin(pluginId: string): Promise<AllOfAPlugin> {
  const e = await devReadEverything()
  if (e !== null) {
    return e.plugins[pluginId]
  } else {
    const url: string = `https://raw.githubusercontent.com/MCDReforged/PluginCatalogue/meta/${pluginId}/all.json`
    const res = await fetch(url, fetchInit)
    return await res.json() as any as AllOfAPlugin
  }
}

function formatDate(date: Date | null): string | undefined {
  return date !== null ? date.toISOString() : undefined;
}

function formatTimestamp(date: Date | null): number {
  return date !== null ? date.getTime() : 0;
}

export async function getSimpleEverything(): Promise<SimpleEverything> {
  const everything = await getEverything()
  const simpleEverything: SimpleEverything = {
    authors: everything.authors,
    plugins: {},
  }
  Object.entries(everything.plugins).forEach(([pluginId, plugin], _) => {
    let downloads = 0
    let latestDate: Date | null = null
    plugin.release['releases'].forEach(r => {
      downloads += r.asset.download_count
      const date: Date = new Date(r.asset.created_at)
      if (latestDate === null || date > latestDate) {
        latestDate = date
      }
    })
    const latestRelease = plugin.release.releases[plugin.release.latest_version_index]
    const latestSimpleRelease: SimpleRelease | undefined = latestRelease === undefined ? undefined : {
      version: latestRelease.meta.version,
      assetName: latestRelease.asset.name,
      assetUrl: latestRelease.asset.browser_download_url,
    }

    simpleEverything.plugins[pluginId] = {
      id: plugin.plugin.id,
      name: plugin.meta.name,
      version: plugin.meta.version,
      description: plugin.meta.description,
      repository: plugin.plugin.repository,
      labels: plugin.plugin.labels,
      authors: plugin.plugin.authors,
      downloads: downloads,
      recentUpdated: formatDate(latestDate),
      recentUpdatedTimestamp: formatTimestamp(latestDate),
      latestRelease: latestSimpleRelease,
    }
  })
  return simpleEverything
}
