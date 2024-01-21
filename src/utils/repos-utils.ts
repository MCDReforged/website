export function getGitHubReposPair(repos: string): string {
  const githubPrefix = 'https://github.com/'
  if (!repos.startsWith(githubPrefix)) {
    return repos
  }
  return repos.substring(githubPrefix.length).replace(/\/$/, '')
}
