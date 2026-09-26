import { CommonContentLayout } from '@/components/layout/common-content-layout'
import { getGuidelines } from '@/server/submit/guidelines'
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

  return (
    <CommonContentLayout>
      <SubmitWizard guidelines={guidelines}/>
    </CommonContentLayout>
  )
}
