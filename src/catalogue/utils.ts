import { AllOfAPlugin, Everything } from "@/catalogue/types";
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
  if (process.env.NODE_ENV === 'development' || process.env.npm_lifecycle_event === 'build') {
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
