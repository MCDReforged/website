import { AllOfAPlugin, AuthorSummary, Everything } from "@/types/plugin-catalogue-meta";
import everything from "./everything.json"

// TODO: Trim AllOfAPlugin

export function getEverything(): Everything {
  return everything as any as Everything
}

export function getAllPlugins(): { [key: string]: AllOfAPlugin } {
  return getEverything().plugins
}

export function getPlugin(key: string): AllOfAPlugin {
  return getAllPlugins()[key]
}

export function getAuthors(): AuthorSummary {
  return getEverything().authors
}
