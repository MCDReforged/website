import { handleRouteError, jsonError } from '@/server/api-utils'
import { getSession } from '@/server/session'
import { createSubmissionPr } from '@/server/submit/create-pr'
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

  const form = parseSubmitForm(body.form)
  const dryRun = body.dryRun !== false

  try {
    const validation = await validateSubmission(session.token, form)
    if (dryRun || validation.errors.length > 0 || validation.pluginInfo === null) {
      return NextResponse.json({ dryRun: true, ...validation })
    }

    const result = await createSubmissionPr(session.token, session.login, validation.pluginInfo)
    return NextResponse.json({ dryRun: false, result })
  } catch (error) {
    return handleRouteError(error)
  }
}
