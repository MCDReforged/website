import { handleRouteError, jsonError } from '@/server/api-utils'
import { getSession } from '@/server/session'
import { SubmitForm } from '@/server/submit/types'
import { validateSubmission } from '@/server/submit/validate'
import { isPluginSubmissionEnabled } from '@/utils/environment-utils'
import { NextRequest, NextResponse } from 'next/server'

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function parseSubmitForm(raw: unknown): SubmitForm {
  const obj = asRecord(raw)

  const authors = Array.isArray(obj.authors) ? obj.authors : []
  const labels = Array.isArray(obj.labels) ? obj.labels.filter((l): l is string => typeof l === 'string') : []

  const introduction: Record<string, string> = {}
  for (const [key, value] of Object.entries(asRecord(obj.introduction))) {
    if (typeof value === 'string') {
      introduction[key] = value
    }
  }

  return {
    repo: typeof obj.repo === 'string' ? obj.repo.trim() : '',
    branch: typeof obj.branch === 'string' ? obj.branch.trim() : '',
    relatedPath: typeof obj.relatedPath === 'string' ? obj.relatedPath : '.',
    id: typeof obj.id === 'string' ? obj.id : '',
    authors: authors.map(item => {
      const author = asRecord(item)
      const name = typeof author.name === 'string' ? author.name : ''
      const link = typeof author.link === 'string' ? author.link : undefined
      return { name, link }
    }),
    labels,
    introduction,
  }
}

/**
 * Runs the catalogue's checks against a submission and reports what the catalogue would show.
 * Nothing is created: the pull request itself is opened on github.com by the user.
 */
export async function POST(request: NextRequest) {
  if (!isPluginSubmissionEnabled()) {
    return jsonError(503, 'Plugin submission is not enabled on this deployment')
  }
  const session = await getSession()
  if (session === null) {
    return jsonError(401, 'Not authenticated')
  }

  let body: Record<string, unknown>
  try {
    body = asRecord(await request.json())
  } catch {
    return jsonError(400, 'Invalid JSON body')
  }

  try {
    return NextResponse.json(await validateSubmission(session.token, parseSubmitForm(body.form)))
  } catch (error) {
    return handleRouteError(error)
  }
}
