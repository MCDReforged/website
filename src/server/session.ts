import { getSessionSecret } from '@/utils/environment-utils'
import { isProduction } from '@/utils/environment-utils'
import { cookies } from 'next/headers'
import { seal, unseal } from './session-crypto'

export const SESSION_COOKIE = 'mcdr-website-session'
export const OAUTH_STATE_COOKIE = 'mcdr-website-oauth-state'

const SESSION_MAX_AGE = 60 * 60 * 24 * 7  // 7 days
const OAUTH_STATE_MAX_AGE = 60 * 10       // 10 minutes

export interface Session {
  /** GitHub OAuth access token. Never leaves the server. */
  token: string
  login: string
  name: string | null
  avatarUrl: string | null
}

export interface OAuthState {
  state: string
  next: string
}

function getSecret(): string {
  const secret = getSessionSecret()
  if (!secret) {
    throw new Error('MW_SESSION_SECRET is not configured')
  }
  return secret
}

export function isSubmissionConfigured(): boolean {
  // `!!` and not `!== undefined`: an empty value would pass the guard here and then throw in getSecret()
  return !!getSessionSecret()
}

export function sealSession(session: Session): string {
  return seal(getSecret(), session)
}

export function sealOAuthState(state: OAuthState): string {
  return seal(getSecret(), state)
}

export function unsealOAuthState(value: string): OAuthState | null {
  const state = unseal<OAuthState>(getSecret(), value)
  if (!state || typeof state.state !== 'string' || typeof state.next !== 'string') {
    return null
  }
  return state
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies()
  const raw = store.get(SESSION_COOKIE)?.value
  if (!raw) {
    return null
  }
  let session: Session | null
  try {
    session = unseal<Session>(getSecret(), raw)
  } catch {
    // MW_SESSION_SECRET is not configured: treat as signed out instead of blowing up
    return null
  }
  if (!session || typeof session.token !== 'string' || typeof session.login !== 'string') {
    return null
  }
  return session
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: isProduction(),
  path: '/',
}

export const SESSION_COOKIE_MAX_AGE = SESSION_MAX_AGE
export const OAUTH_STATE_COOKIE_MAX_AGE = OAUTH_STATE_MAX_AGE
