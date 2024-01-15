import { AllOfAPlugin, AuthorSummary, Everything } from "@/catalogue/types";
import fs from 'fs/promises'
import path from "path";

const useLocalData = process.env.NODE_ENV === 'development'
const isrInterval = 3 * 60
const everythingUrl = 'https://raw.githubusercontent.com/MCDReforged/PluginCatalogue/meta/everything.json'

async function fileExists(filePath: string) {
    try {
        await fs.access(filePath)
        return true
    } catch (error) {
        return false
    }
}

export async function getEverything(): Promise<Everything> {
  const localDataPath = path.join(process.cwd(), 'src', 'catalogue', 'everything.json')
  if (useLocalData && await fileExists(localDataPath)) {
    const content = await fs.readFile(localDataPath, 'utf8')
    return JSON.parse(content) as any as Everything
  } else {
    const res = await fetch(everythingUrl, { next: { revalidate: isrInterval }})
    return await res.json() as any as Everything
  }
}

export async function getAllPlugins(): Promise<{ [key: string]: AllOfAPlugin }> {
  const everything = await getEverything()
  return everything.plugins
}

export async function getPlugin(key: string): Promise<AllOfAPlugin> {
  const plugins = await getAllPlugins()
  return plugins[key]
}

export async function getAuthors(): Promise<AuthorSummary> {
  const everything = await getEverything()
  return everything.authors
}
