import { handleRouteError, jsonError } from '@/server/api-utils'
import { getSession } from '@/server/session'
import { listUserRepos } from '@/server/submit/repo'
import { isPluginSubmissionEnabled } from '@/utils/environment-utils'
import { NextResponse } from 'next/server'

export async function GET() {
  if (!isPluginSubmissionEnabled()) {
    return jsonError(503, 'Plugin submission is not enabled on this deployment')
  }
  const session = await getSession()
  if (session === null) {
    return jsonError(401, 'Not authenticated')
  }

  try {
    const { repos, truncated } = await listUserRepos(session.token)
    return NextResponse.json({ repos, truncated })
  } catch (error) {
    return handleRouteError(error)
  }
}
