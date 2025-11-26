export const siteConfig = {
  title: 'MCDReforged',
  titleTemplate: '%s - MCDReforged',
  description: 'MCDReforged official website',
  favicon: "/favicon.svg",
  links: {
    website: "https://mcdreforged.com",
    docs: "https://docs.mcdreforged.com",
    githubMcdr: "https://github.com/MCDReforged/MCDReforged",
    githubWebsite: "https://github.com/MCDReforged/website",
    githubCatalogue: "https://github.com/MCDReforged/PluginCatalogue",
    pypi: "https://pypi.org/project/mcdreforged",
    dockerhub: "https://hub.docker.com/r/mcdreforged/mcdreforged",
  },

  // Files to sync:
  // - "src/messages" translation files
  // - "config.matcher" in "src/proxy.ts"
  languages: [
    'en',
    'zh-CN',
  ],
  defaultLanguage: 'en',
}
