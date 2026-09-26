# MCDReforged Website

The official website of [MCDReforged](https://github.com/MCDReforged/MCDReforged), built with:

- [Next.js](https://nextjs.org/) 
- [Mantine UI](https://mantine.dev/) 
- [Tailwind CSS](https://tailwindcss.com/)

## Visit the website

- Production: https://mcdreforged.com
- Production (backup): https://mcdreforged.vercel.app
- Development: https://website-dev.mcdreforged.com (associated with the [dev](https://github.com/MCDReforged/website/tree/dev) branch)

## Usage

Install requirements

```bash
npm install
```

Run dev server

```bash
npm run dev
```

Build

```bash
npm run build
```

## Plugin submission

The website can validate a plugin before it is submitted, and then hand the commit over to
github.com: the wizard accepts a plugin repository url, checks it against the catalogue's rules,
and links to the fork page plus a "create file" page that already carries the path and the file
content, so the pull request is opened entirely in github's own editor.

**No credentials are involved.** The wizard runs in the browser and reads public repositories
straight from the GitHub API; nothing is proxied, no token is stored, and the site itself never
writes anything. This matches the rest of the website, which reads the catalogue data and the
contributing guidelines from `raw.githubusercontent.com`.

| Variable | Required | Description |
| --- | --- | --- |
| `MW_CATALOGUE_REPO` | no | catalogue repository, defaults to `MCDReforged/PluginCatalogue` |
| `MW_CATALOGUE_BRANCH` | no | the catalogue's default branch, defaults to `master` |
| `MW_GITHUB_API_BASE` | no | GitHub API base url, defaults to `https://api.github.com` |
| `MW_DISABLE_PLUGIN_SUBMISSION` | no | set to `true` to turn the feature off |

The GitHub API allows 60 anonymous requests per hour per address, which the wizard stays well
under: responses are cached for a minute (the repository tree would otherwise be fetched twice),
and reaching the limit is reported with an explanation instead of a silent failure.
