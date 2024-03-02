import { isProduction } from "@/utils/environment-utils";
import Script from "next/script";

export function StatsScripts() {
  if (!isProduction()) {
    return <></>
  }

  // https://umami.is/docs/collect-data
  // see REPOS_ROOT/vercel.json for rewrite rule
  return (
    <>
      <Script
        defer
        src="/stats/script.js"
        data-website-id="a6e9aacd-d83f-4b6b-bff4-1eccde37e68c"
      />
    </>
  )
}
