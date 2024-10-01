export function getGitHubReposPair(repos: string): string {
  const githubPrefix = 'https://github.com/'
  if (!repos.startsWith(githubPrefix)) {
    return repos
  }
  return repos.substring(githubPrefix.length).replace(/\/$/, '')
}

interface LinkData {
  href: string
  display: string
}

/**
 * Input example: "https://raw.githubusercontent.com/TISUnion/QuickBackupM/master/README.md"
 * Output example: {
 *   href: "https://github.com/TISUnion/QuickBackupM/blob/master/README.md",
 *   display: "README.md",
 * }
 */
export function rawToRelative(url: string | undefined, plugin_repository_url: string, plugin_branch: string): LinkData | undefined {
  // TISUnion/QuickBackupM/master/README.md
  const parts = url?.replace(/https:\/\/raw.githubusercontent.com\//, '').split('/')
  if (parts && parts.length >= 4) {
    const reposPair = parts.slice(0, 2).join('/')
    const reposUrl = `https://github.com/${reposPair}`
    const branch = parts[2]
    const path = parts.slice(3).join('/')
    if (reposUrl === plugin_repository_url && branch === plugin_branch) {
      // https://raw.githubusercontent.com/TISUnion/QuickBackupM/master/README.md
      // https://github.com/TISUnion/QuickBackupM/blob/master/README.md
      return {
        href: `${reposUrl}/blob/${branch}/${path}`,
        display: path,
      }
    }
  }
}
