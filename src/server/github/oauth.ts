import { getGithubOAuthClientId, getGithubOAuthClientSecret } from '@/utils/environment-utils'
import { GithubUser, githubRequest } from './client'

const AUTHORIZE_URL = 'https://github.com/login/oauth/authorize'
const TOKEN_URL = 'https://github.com/login/oauth/access_token'

/** Least privilege scope: read public repos, fork public repos, open PRs on public repos. */
export const OAUTH_SCOPE = 'public_repo'

export function isOAuthConfigured(): boolean {
  return getGithubOAuthClientId() !== undefined && getGithubOAuthClientSecret() !== undefined
}

function requireCredentials(): { clientId: string, clientSecret: string } {
  const clientId = getGithubOAuthClientId()
  const clientSecret = getGithubOAuthClientSecret()
  if (!clientId || !clientSecret) {
    throw new Error('GitHub OAuth is not configured: MW_GITHUB_OAUTH_CLIENT_ID / MW_GITHUB_OAUTH_CLIENT_SECRET')
  }
  return { clientId, clientSecret }
}

export function callbackUrl(baseUrl: string): string {
  return baseUrl + '/api/auth/github/callback'
}

export function buildAuthorizeUrl(redirectUri: string, state: string): string {
  const { clientId } = requireCredentials()
  const url = new URL(AUTHORIZE_URL)
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', OAUTH_SCOPE)
  url.searchParams.set('state', state)
  return url.toString()
}

export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
  const { clientId, clientSecret } = requireCredentials()
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'user-agent': 'mcdreforged-website',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
    cache: 'no-store',
  })

  const data = await response.json() as { access_token?: string, error?: string, error_description?: string }
  if (!response.ok || typeof data.access_token !== 'string') {
    throw new Error(`GitHub OAuth token exchange failed: ${data.error_description || data.error || response.statusText}`)
  }
  return data.access_token
}

export async function getAuthenticatedUser(token: string): Promise<GithubUser> {
  return githubRequest<GithubUser>('/user', { token })
}
