import { GithubApiError } from '@/server/github/client'
import { NextResponse } from 'next/server'

export function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status })
}

export function handleRouteError(error: unknown): NextResponse {
  if (error instanceof GithubApiError) {
    const status = error.status === 401 || error.status === 403 ? error.status : 502
    return jsonError(status, error.apiMessage)
  }
  console.error('[plugin-submission]', error)
  return jsonError(500, error instanceof Error ? error.message : 'Internal error')
}
