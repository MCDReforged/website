import { isOAuthConfigured } from '@/server/github/oauth'
import { getSession, isSubmissionConfigured } from '@/server/session'
import { getCatalogueRepo, isPluginSubmissionEnabled } from '@/utils/environment-utils'
import { NextResponse } from 'next/server'

export interface SessionResponse {
  enabled: boolean
  authenticated: boolean
  catalogueRepo: string
  user?: {
    login: string
    name: string | null
    avatarUrl: string | null
  }
}

export async function GET() {
  const enabled = isPluginSubmissionEnabled() && isOAuthConfigured() && isSubmissionConfigured()
  const session = enabled ? await getSession() : null

  const body: SessionResponse = {
    enabled,
    authenticated: session !== null,
    catalogueRepo: getCatalogueRepo(),
    user: session === null ? undefined : {
      login: session.login,
      name: session.name,
      avatarUrl: session.avatarUrl,
    },
  }
  return NextResponse.json(body)
}
