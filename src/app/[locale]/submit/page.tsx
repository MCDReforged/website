import { getEverything } from '@/catalogue/data'
import { CommonContentLayout } from '@/components/layout/common-content-layout'
import { getGuidelines } from '@/server/guidelines'
import { getCatalogueBranch, getCatalogueRepo, getGithubApiBase, isPluginSubmissionEnabled } from '@/utils/environment-utils'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import React from 'react'
import { SubmitWizard } from './submit-wizard'

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params
  const t = await getTranslations({ locale, namespace: 'metadata.title' })
  return {
    title: t('submit'),
  }
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params
  setRequestLocale(locale)
  const guidelines = await getGuidelines(locale)
  // the ids the catalogue already knows, straight from the cache the rest of the site reads. One
  // submission needs the existence of its own id (a file probe) and the closest existing id, and
  // neither is worth a live API call.
  const catalogueIds = Object.keys((await getEverything()).plugins)

  return (
    <CommonContentLayout>
      <SubmitWizard
        guidelines={guidelines}
        enabled={isPluginSubmissionEnabled()}
        catalogueRepo={getCatalogueRepo()}
        catalogueBranch={getCatalogueBranch()}
        apiBase={getGithubApiBase()}
        catalogueIds={catalogueIds}
      />
    </CommonContentLayout>
  )
}
