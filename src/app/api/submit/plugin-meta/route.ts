import { handleRouteError, jsonError } from '@/server/api-utils'
import { getSession } from '@/server/session'
import { isSafeRelatedPath, normalizeRelatedPath } from '@/utils/plugin-path-utils'
import { resolvePluginCandidate, splitRepo } from '@/server/submit/repo'
import { isPluginSubmissionEnabled } from '@/utils/environment-utils'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Reads `relatedPath/mcdreforged.plugin.json`, so the wizard can show the plugin id declared by
 * the repository instead of letting the user type it.
 */
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
  const relatedPath = normalizeRelatedPath(request.nextUrl.searchParams.get('relatedPath') ?? '')
  if (repo === null || splitRepo(repo) === null) {
    return jsonError(400, 'Invalid repository')
  }
  if (!isSafeRelatedPath(relatedPath)) {
    return jsonError(400, 'Invalid related path')
  }

  try {
    const candidate = await resolvePluginCandidate(session.token, repo, branch, relatedPath, session.login)
    return NextResponse.json({ relatedPath, candidate })
  } catch (error) {
    return handleRouteError(error)
  }
}
