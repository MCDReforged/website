import { handleRouteError, jsonError } from '@/server/api-utils'
import { getSession } from '@/server/session'
import { getRepoInfo, tryGetRepo } from '@/server/submit/repo'
import { ForkStatus } from '@/server/submit/types'
import { getCatalogueRepo, isPluginSubmissionEnabled } from '@/utils/environment-utils'
import { NextResponse } from 'next/server'

/**
 * Whether the signed-in user already has a fork of the catalogue. The fork is created by the user
 * on github.com, so the wizard only needs to know whether that step can be skipped, whether a
 * repository already sitting under the fork's name is actually a fork of the catalogue, and which
 * branch a new file has to be created on.
 */
export async function GET() {
  if (!isPluginSubmissionEnabled()) {
    return jsonError(503, 'Plugin submission is not enabled on this deployment')
  }
  const session = await getSession()
  if (session === null) {
    return jsonError(401, 'Not authenticated')
  }

  try {
    const catalogue = getCatalogueRepo()
    const name = catalogue.split('/')[1]
    const [fork, catalogueRepo] = await Promise.all([
      tryGetRepo(session.token, `${session.login}/${name}`),
      getRepoInfo(session.token, catalogue),
    ])
    const status: ForkStatus = {
      login: session.login,
      forkExists: fork !== null,
      forkOfCatalogue: fork?.parent?.full_name?.toLowerCase() === catalogue.toLowerCase(),
      // maintainers cannot fork their own repository, and do not need to: they can commit directly
      canPushToCatalogue: catalogueRepo.permissions?.push === true,
      branch: catalogueRepo.default_branch,
    }
    return NextResponse.json(status)
  } catch (error) {
    return handleRouteError(error)
  }
}
