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

The website can let users sign in with GitHub, pick a plugin repository, validate the
`plugin_info.json` it is about to add, and open a submission pull request to the plugin
catalogue. The feature is optional: without the environment variables below the submission
page just shows a notice.

Create a GitHub OAuth App, then configure:

| Variable | Required | Description |
| --- | --- | --- |
| `MW_GITHUB_OAUTH_CLIENT_ID` | yes | OAuth App client id |
| `MW_GITHUB_OAUTH_CLIENT_SECRET` | yes | OAuth App client secret |
| `MW_SESSION_SECRET` | yes | random string used to encrypt the session cookie, e.g. `openssl rand -hex 32` |
| `MW_CATALOGUE_REPO` | no | catalogue repository, defaults to `MCDReforged/PluginCatalogue` |
| `MW_GITHUB_API_BASE` | no | GitHub API base url, defaults to `https://api.github.com` |
| `MW_SITE_BASE_URL` | no | public base url, defaults to the request origin |
| `MW_DISABLE_PLUGIN_SUBMISSION` | no | set to `true` to turn the feature off |

Register these callback URLs on the OAuth App:

- `https://mcdreforged.com/api/auth/github/callback`
- `https://website-dev.mcdreforged.com/api/auth/github/callback`
- `http://localhost:3000/api/auth/github/callback`

The requested scope is `public_repo`: list the user's public repositories, fork the catalogue,
and open a pull request on the user's behalf. The access token is kept in an encrypted,
httpOnly cookie and is never exposed to the browser; every GitHub call is proxied by the
server. When the user can already push to the catalogue, the branch is created in the
catalogue itself instead of a fork.
