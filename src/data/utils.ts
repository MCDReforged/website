import { Everything } from "@/types/plugin-catalogue-meta";
import everythingData from './everything.json'

const everything = everythingData as any as Everything

// TODO: optimize size
export function getEverything(): Everything {
  return everything
}
