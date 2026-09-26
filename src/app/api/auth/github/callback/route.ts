import { callbackUrl, exchangeCodeForToken, getAuthenticatedUser, isOAuthConfigured } from '@/server/github/oauth'
import { isEqualString } from '@/server/session-crypto'
import {
  OAUTH_STATE_COOKIE,
  SESSION_COOKIE,
  SESSION_COOKIE_MAX_AGE,
  isSubmissionConfigured,
  sealSession,
  sessionCookieOptions,
  unsealOAuthState,
} from '@/server/session'
import { getSiteBaseUrl, isPluginSubmissionEnabled } from '@/utils/environment-utils'
import { safeRedirectPath } from '@/utils/redirect-utils'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const baseUrl = getSiteBaseUrl(request.nextUrl.origin)

  const fail = (reason: string) => {
    const url = new URL('/submit', baseUrl)
    url.searchParams.set('error', reason)
    const response = NextResponse.redirect(url)
    response.cookies.delete(OAUTH_STATE_COOKIE)
    return response
  }

  if (!isPluginSubmissionEnabled() || !isOAuthConfigured() || !isSubmissionConfigured()) {
    return fail('disabled')
  }

  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const rawState = request.cookies.get(OAUTH_STATE_COOKIE)?.value
  const savedState = rawState !== undefined ? unsealOAuthState(rawState) : null

  if (code === null || state === null || savedState === null || !isEqualString(savedState.state, state)) {
    return fail('state_mismatch')
  }

  let token: string
  let user
  try {
    token = await exchangeCodeForToken(code, callbackUrl(baseUrl))
    user = await getAuthenticatedUser(token)
  } catch (error) {
    console.error('[plugin-submission] oauth exchange failed', error)
    return fail('exchange_failed')
  }

  // re-checked here as well: a state cookie sealed by an older build must not be able to redirect off site
  const response = NextResponse.redirect(new URL(safeRedirectPath(savedState.next, '/submit'), baseUrl))
  response.cookies.set(
    SESSION_COOKIE,
    sealSession({ token, login: user.login, name: user.name, avatarUrl: user.avatar_url }),
    { ...sessionCookieOptions, maxAge: SESSION_COOKIE_MAX_AGE },
  )
  response.cookies.delete(OAUTH_STATE_COOKIE)
  return response
}
