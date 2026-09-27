'use client'

import type { SubmitIssue, SubmissionReport } from '@/submit/types'
import { Anchor, Text, Table } from '@mantine/core'
import { resolvePluginRelative } from '@/submit/plugin-path-utils'
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import React from 'react'

function CheckIcon({ valid }: { valid: boolean }) {
  return valid
    ? <IconCircleCheck size={18} className="text-green-600"/>
    : <IconAlertTriangle size={18} className="text-yellow-600"/>
}

interface RowProps {
  label: React.ReactNode
  value: React.ReactNode
  valid: boolean | null
}

function Row({ label, value, valid }: RowProps) {
  return (
    <Table.Tr>
      <Table.Td className="whitespace-nowrap align-top">{label}</Table.Td>
      <Table.Td className="align-top">{value}</Table.Td>
      <Table.Td className="w-[60px] align-top">
        {/* flex, not text-align: tailwind's preflight makes `svg` display:block, which text-align cannot centre */}
        <div className="flex justify-center">{valid === null ? '-' : <CheckIcon valid={valid}/>}</div>
      </Table.Td>
    </Table.Tr>
  )
}

function SectionRow({ children }: { children: React.ReactNode }) {
  return (
    <Table.Tr>
      <Table.Td colSpan={3} className="bg-mantine-light-gray-background">
        <Text size="sm" fw={600}>{children}</Text>
      </Table.Td>
    </Table.Tr>
  )
}

function Empty() {
  return <Text size="sm" c="dimmed">-</Text>
}

function LangLine({ language, children }: { language: string, children: React.ReactNode }) {
  return (
    <Text size="sm">
      <Text span size="xs" c="dimmed" ff="monospace">{language}</Text> {children}
    </Text>
  )
}

function external(url: string, text: string) {
  return <Anchor href={url} target="_blank" rel="noreferrer noopener" size="sm">{text}</Anchor>
}

function Description({ value, fallback }: { value: string | Record<string, string> | undefined, fallback: string }) {
  if (value === undefined) {
    return <Text size="sm" c="yellow.7">{fallback}</Text>
  }
  if (typeof value === 'string') {
    return <Text size="sm">{value}</Text>
  }
  const entries = Object.entries(value)
  if (entries.length === 0) {
    return <Text size="sm" c="yellow.7">{fallback}</Text>
  }
  return (
    <>
      {entries.map(([language, text]) => (
        <LangLine key={language} language={language}>{text}</LangLine>
      ))}
    </>
  )
}

export function SubmissionReportView(
  { report, errors, warnings }: { report: SubmissionReport, errors: SubmitIssue[], warnings: SubmitIssue[] },
) {
  const t = useTranslations('page.submit.report')
  const repoBase = `https://github.com/${report.repo}`
  const treeUrl = report.relatedPath === '.'
    ? `${repoBase}/tree/${report.branch}`
    : `${repoBase}/tree/${report.branch}/${report.relatedPath}`
  const blobUrl = (path: string) =>
    `${repoBase}/blob/${report.branch}/${resolvePluginRelative(report.relatedPath, path) ?? path}`

  const hasIssue = (code: SubmitIssue['code']) =>
    errors.some(issue => issue.code === code) || warnings.some(issue => issue.code === code)
  const releaseUnchecked = hasIssue('release_unchecked')
  const filesUnchecked = hasIssue('files_unchecked')
  const metadata = report.metadata

  return (
    <Table withTableBorder withColumnBorders>
      <Table.Tbody>
        <SectionRow>{t('plugin_info_title')}</SectionRow>
        <Row
          label={t('repository')}
          valid
          value={external(treeUrl, `${report.repo}@${report.branch}${report.relatedPath === '.' ? '' : '/' + report.relatedPath}`)}
        />
        <Row
          label={t('authors')}
          valid={!hasIssue('authors_missing') && !hasIssue('authors_invalid')}
          value={report.authors.length === 0 ? <Empty/> : (
            <Text size="sm">
              {report.authors.map((author, index) => (
                <React.Fragment key={index}>
                  {index > 0 && ', '}
                  {author.link === undefined ? author.name : external(author.link, author.name)}
                </React.Fragment>
              ))}
            </Text>
          )}
        />
        <Row
          label={t('license')}
          valid={report.license.detected}
          value={report.license.detected
            ? <Text size="sm" ff="monospace">{report.license.files.join(', ')}</Text>
            : filesUnchecked
              ? <Text size="sm" c="dimmed">{t('not_checked')}</Text>
              : <Text size="sm" c="yellow.7">{t('not_detected')}</Text>}
        />
        <Row
          label={t('labels')}
          valid={!hasIssue('labels_missing') && !hasIssue('label_invalid')}
          value={report.labels.length === 0
            ? <Empty/>
            : <Text size="sm" ff="monospace">{report.labels.join(', ')}</Text>}
        />
        <Row
          label={t('introduction')}
          valid={!hasIssue('introduction_path_not_found') && !hasIssue('introduction_missing')}
          value={Object.keys(report.introduction).length === 0 ? <Empty/> : (
            <>
              {Object.entries(report.introduction).map(([language, path]) => (
                <LangLine key={language} language={language}>{external(blobUrl(path), path)}</LangLine>
              ))}
            </>
          )}
        />
        <Row
          label={t('meta')}
          valid={metadata !== null}
          value={<Text size="sm" ff="monospace">{report.pluginJsonPath}</Text>}
        />
        <Row
          label={t('latest_release')}
          valid={report.release !== null}
          value={releaseUnchecked ? t('not_checked') : report.release === null
            ? <Text size="sm" c="yellow.7">{t('none')}</Text>
            : <Text size="sm">
              {report.release.url === null
                ? report.release.tag
                : external(report.release.url, report.release.tag)}
              <Text span size="xs" c="dimmed" ff="monospace"> {report.release.asset}</Text>
            </Text>}
        />

        {metadata !== null && (
          <>
            <SectionRow>{t('metadata_title')}</SectionRow>
            <Row label={t('metadata.name')} valid={null} value={<Text size="sm">{metadata.name ?? '-'}</Text>}/>
            <Row label={t('metadata.version')} valid={null} value={<Text size="sm" ff="monospace">{metadata.version ?? '-'}</Text>}/>
            <Row label={t('metadata.authors')} valid={null} value={<Text size="sm">{metadata.authors.join(', ') || '-'}</Text>}/>
            <Row label={t('metadata.description')} valid={null} value={<Description value={metadata.description} fallback={t('none')}/>}/>
            <Row
              label={t('metadata.dependencies')}
              valid={null}
              value={Object.keys(metadata.dependencies).length === 0 ? <Empty/> : (
                <>
                  {Object.entries(metadata.dependencies).map(([name, requirement]) => (
                    <Text key={name} component="div" size="sm" ff="monospace">{name}: {requirement}</Text>
                  ))}
                </>
              )}
            />
            {metadata.homepage !== undefined && (
              <Row label={t('metadata.homepage')} valid={null} value={external(metadata.homepage, metadata.homepage)}/>
            )}
          </>
        )}
      </Table.Tbody>
    </Table>
  )
}
