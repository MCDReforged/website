import { AllOfAPlugin, Everything } from "@/catalogue/meta-types";
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
    simpleEverything.plugins[pluginId] = createSimplePlugin(plugin, everything.authors)
  })
  return simpleEverything
}
