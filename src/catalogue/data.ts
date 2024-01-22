import { AllOfAPlugin, Everything } from "@/catalogue/meta-types";
import { SimpleEverything } from "@/catalogue/simple-types";
import fs from 'fs/promises'
import { promisify } from "node:util";
import { gunzip } from "node:zlib";
import path from "path";
import { createSimpleEverything } from "./conversion";

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

const gunzipAsync = promisify(gunzip)

export async function fetchEverything(): Promise<Everything> {
  const url: string = 'https://raw.githubusercontent.com/MCDReforged/PluginCatalogue/meta/everything.json.gz'
  const rsp = await fetch(url, fetchInit)
  const buf = Buffer.from(await rsp.arrayBuffer())
  const raw = await gunzipAsync(buf);
  const data = JSON.parse(raw.toString('utf8'))
  return data as any as Everything
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
  return createSimpleEverything(everything)
}
