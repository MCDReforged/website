import { buildAuthorizeUrl, callbackUrl, isOAuthConfigured } from '@/server/github/oauth'
import { OAUTH_STATE_COOKIE, OAUTH_STATE_COOKIE_MAX_AGE, isSubmissionConfigured, sealOAuthState, sessionCookieOptions } from '@/server/session'
import { getSiteBaseUrl, isPluginSubmissionEnabled } from '@/utils/environment-utils'
import { safeRedirectPath } from '@/utils/redirect-utils'
import { randomBytes } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  if (!isPluginSubmissionEnabled() || !isOAuthConfigured() || !isSubmissionConfigured()) {
    return NextResponse.json({ error: 'Plugin submission is not enabled on this deployment' }, { status: 503 })
  }

  const baseUrl = getSiteBaseUrl(request.nextUrl.origin)
  const next = safeRedirectPath(request.nextUrl.searchParams.get('next'), '/submit')
  const state = randomBytes(16).toString('hex')

  const response = NextResponse.redirect(buildAuthorizeUrl(callbackUrl(baseUrl), state))
  response.cookies.set(OAUTH_STATE_COOKIE, sealOAuthState({ state, next }), {
    ...sessionCookieOptions,
    maxAge: OAUTH_STATE_COOKIE_MAX_AGE,
  })
  return response
}
