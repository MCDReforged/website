import { isProduction } from "@/utils/environment-utils";
import Script from "next/script";

export function StatsScripts() {
  if (!isProduction()) {
    return <></>
  }

  // https://umami.is/docs/collect-data
  return (
    <Script
      defer
      async
      src="https://umami.fallenbreath.me/script.js"
      data-website-id="a6e9aacd-d83f-4b6b-bff4-1eccde37e68c"
    />
  )
}
