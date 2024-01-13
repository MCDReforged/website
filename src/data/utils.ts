import { AllOfAPlugin, AuthorSummary, Everything } from "@/types/plugin-catalogue-meta";
import fs from "fs";
import path from "path";

function loadEverything(): Everything {
  const content = fs.readFileSync(path.join(process.cwd(), 'src', 'data', 'everything.json'), 'utf8')
  const data = JSON.parse(content)
  return data as Everything
}

// TODO: Trim AllOfAPlugin

export function getEverything(): Everything {
  return loadEverything()
}

export function getAllPlugins(): { [key: string]: AllOfAPlugin } {
  return loadEverything().plugins
}

export function getPlugin(key: string): AllOfAPlugin {
  return getAllPlugins()[key]
}

export function getAuthors(): AuthorSummary {
  return loadEverything().authors
}
