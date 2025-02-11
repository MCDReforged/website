import { getGitInfo } from "@/site/git-info";
import { MetadataRoute } from "next";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const gitInfo = await getGitInfo()
  const isDevWebsite = gitInfo?.isDev ?? false

  return {
    rules: {
      userAgent: '*',
      [isDevWebsite ? 'disallow' : 'allow']: '/',
    },
  }
}
