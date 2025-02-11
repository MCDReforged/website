export const githubProxyHomepage = "https://ghfast.top/"
const githubProxyDecorationPrefix = "https://ghfast.top/"

export function decorateWithGitHubProxy(rawUrl: string): string {
  return githubProxyDecorationPrefix + rawUrl
}
