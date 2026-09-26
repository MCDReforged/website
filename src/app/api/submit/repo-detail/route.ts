import { handleRouteError, jsonError } from '@/server/api-utils'
import { getSession } from '@/server/session'
import { getRepoDetail, splitRepo } from '@/server/submit/repo'
import { isPluginSubmissionEnabled } from '@/utils/environment-utils'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  if (!isPluginSubmissionEnabled()) {
    return jsonError(503, 'Plugin submission is not enabled on this deployment')
  }
  const session = await getSession()
  if (session === null) {
    return jsonError(401, 'Not authenticated')
  }

  const repo = request.nextUrl.searchParams.get('repo')
  const branch = request.nextUrl.searchParams.get('branch') ?? undefined
  if (repo === null || splitRepo(repo) === null) {
    return jsonError(400, 'Invalid repository')
  }

  try {
    return NextResponse.json(await getRepoDetail(session.token, repo, branch, session.login))
  } catch (error) {
    return handleRouteError(error)
  }
}
