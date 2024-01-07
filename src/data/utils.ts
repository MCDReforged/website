import {Everything} from "@/types/plugin-catalogue-meta";
import everythingData from './everything.json'

const everything = everythingData as any as Everything

export function getEverything(): Everything {
  return everything
}
