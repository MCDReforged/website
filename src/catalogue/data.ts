import { AllOfAPlugin, Everything, PluginInfo } from "@/catalogue/meta-types";
import { SimpleEverything } from "@/catalogue/simple-types";
import fs from 'fs/promises'
import path from "path";
import { createSimplePlugin } from "./conversion";

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

export async function fetchEverything(): Promise<Everything> {
  const url: string = 'https://raw.githubusercontent.com/MCDReforged/PluginCatalogue/meta/everything.json'
  const res = await fetch(url, fetchInit)
  return await res.json() as any as Everything
}

export async function getEverything(): Promise<Everything> {
  const e = await devReadEverything()
  if (e !== null) {
    return e
  } else {
    return await fetchEverything()
  }
}

export async function getPlugin(pluginId: string): Promise<AllOfAPlugin> {
  const e = await getEverything()
  return e.plugins[pluginId]
}

export async function getSimpleEverything(): Promise<SimpleEverything> {
  const everything = await getEverything()
  const simpleEverything: SimpleEverything = {
    timestamp: everything.timestamp,
    authors: everything.authors,
    plugins: {},
  }
  Object.entries(everything.plugins).forEach(([pluginId, plugin], _) => {
    simpleEverything.plugins[pluginId] = createSimplePlugin(plugin)
  })
  return simpleEverything
}

export async function fetchReadme(plugin: PluginInfo): Promise<string | undefined> {
  const githubPrefix = 'https://github.com/'
  const repos = plugin.repository
  if (!repos.startsWith(githubPrefix)) {
    return undefined
  }
  const reposPair = repos.substring(githubPrefix.length).replace(/\/$/, '')
  let url = `https://raw.githubusercontent.com/${reposPair}/${plugin.branch}/`
  if (plugin.related_path !== '.') {
    url += plugin.related_path.replace(/\/$/, '') + '/'
  }
  // TODO: figure out how to make next.js use http proxy
  if (process.env.USE_GITHUB_PROXY === 'true') {
    url = 'https://mirror.ghproxy.com/' + url
  }

  const candidateFiles = ['readme.md', 'README.MD', 'README.md']
  const errors: any[] = []
  const fetchPromises: Promise<string | undefined>[] = candidateFiles.map(
    file => fetch(url + file, fetchInit)
      .then(response => response.status == 200 ? response.text() : undefined)
      .catch((e) => {errors.push(e); return undefined})
  );

  const readme = (await Promise.all(fetchPromises)).find(result => result !== undefined)
  if (readme === undefined || errors.length > 0) {
    console.log(`Fetch readme for plugin ${plugin.id} failed, errors: ${errors}`)
  }
  return readme
}
