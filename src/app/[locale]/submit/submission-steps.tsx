'use client'

import {
  Alert,
  Button,
  Code,
  CopyButton,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core'
import {
  IconAlertTriangle,
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconFileText,
  IconGitFork,
} from '@tabler/icons-react'
import React from 'react'
import { useTranslations } from 'next-intl'

function GhButton({ children, caret = false, radio = false }: {
  children: React.ReactNode
  caret?: boolean
  radio?: boolean
}) {
  return (
    <span
      className="inline-flex items-center gap-[3px] rounded-sm px-[8px] py-[4px] text-[11px] font-semibold whitespace-nowrap"
      style={radio
        ? { border: '1px solid var(--mantine-color-default-border)' }
        : { backgroundColor: '#347d39', color: '#ffffff' }}
    >
      {radio && <span className="mr-[2px] inline-block h-[9px] w-[9px] rounded-sm border-2 border-current"/>}
      {children}
      {caret && <span className="ml-[1px] text-[9px]">▾</span>}
    </span>
  )
}

function StepNumber({ n }: { n: number }) {
  return (
    <ThemeIcon size={22} radius="xl" variant="light">
      <Text size="xs" fw={700}>{n}</Text>
    </ThemeIcon>
  )
}

function Step({ n, children }: { n: number, children: React.ReactNode }) {
  return (
    <Group align="flex-start" wrap="nowrap" gap="sm">
      <StepNumber n={n}/>
      <div className="min-w-0 flex-1">{children}</div>
    </Group>
  )
}

export function SubmissionSteps({
  catalogueRepo,
  forkName,
  forkExists,
  forkAheadBy,
  forkUrl,
  fileUrl,
  path,
  jsonValue,
}: {
  catalogueRepo: string
  forkName: string
  forkExists: boolean
  forkAheadBy: number
  forkUrl: string
  fileUrl: string | null
  path: string
  jsonValue: string
}) {
  const t = useTranslations('page.submit.submit')

  return (
    <Paper withBorder p="md">
      <Stack gap="lg">
        <Text fw={500}>{t('title')}</Text>

        <Stack gap="lg">
          <Step n={1}>
              <Text size="sm">{t('step_fork_hint', { repo: catalogueRepo })}</Text>
              <Stack gap={6} mt="xs" align="flex-start">
                {forkExists ? (
                  <>
                    <Text size="sm" c="dimmed">{t('step_fork_exists', { repo: forkName })}</Text>
                    <Button
                      component="a"
                      href={forkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="default"
                      size="xs"
                      rightSection={<IconExternalLink size={14}/>}
                    >
                      {t('step_fork_open', { repo: forkName })}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      component="a"
                      href={forkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="light"
                      size="xs"
                      leftSection={<IconGitFork size={16}/>}
                      rightSection={<IconExternalLink size={14}/>}
                    >
                      {t('step_fork_button')}
                    </Button>
                    <Text size="sm" c="dimmed">{t('step_fork_or_open')}</Text>
                  </>
                )}
                {/* a fork that is behind is harmless — a pull request is diffed from the merge base —
                    but extra commits travel with it */}
                {forkAheadBy > 0 && (
                  <Alert color="yellow" icon={<IconAlertTriangle size={16}/>} p="xs">
                    <Text size="sm">{t('fork_ahead', { repo: forkName, count: forkAheadBy })}</Text>
                  </Alert>
                )}
              </Stack>
            </Step>

          <Step n={2}>
            <Text size="sm">{t('step_file_hint')}</Text>
            <Stack gap="xs" mt="xs">
              <Group gap="xs">
                {fileUrl !== null && (
                  <Button
                    component="a"
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="xs"
                    leftSection={<IconFileText size={16}/>}
                    rightSection={<IconExternalLink size={14}/>}
                  >
                    {t('step_file_button')}
                  </Button>
                )}
              </Group>

              <Text size="sm" c="dimmed">
                {t.rich('step_file_manual', {
                  addFile: chunks => <GhButton caret>{chunks}</GhButton>,
                  createFile: chunks => <GhButton>{chunks}</GhButton>,
                })}
              </Text>
              <Group gap="xs">
                <Text size="sm" c="dimmed">{t('path')}</Text>
                <Code>{path}</Code>
                <CopyButton value={path} timeout={2000}>
                  {({ copied, copy }) => (
                    <Button
                      variant="subtle"
                      size="compact-xs"
                      onClick={copy}
                      aria-label={t('copy_path')}
                      leftSection={copied ? <IconCheck size={14}/> : <IconCopy size={14}/>}
                    >
                      {copied ? t('copied') : t('copy_path')}
                    </Button>
                  )}
                </CopyButton>
              </Group>

              <Group gap="xs">  
                <CopyButton value={jsonValue} timeout={2000}>
                    {({ copied, copy }) => (
                      <Button
                        variant={fileUrl === null ? 'light' : 'default'}
                        size="xs"
                        onClick={copy}
                        leftSection={copied ? <IconCheck size={16}/> : <IconCopy size={16}/>}
                      >
                        {copied ? t('copied') : t('copy')}
                      </Button>
                    )}
                </CopyButton>
              </Group>
            </Stack>
          </Step>

          <Step n={3}>
            <Text size="sm">
              {t.rich('step_commit_hint', {
                option: chunks => <GhButton radio>{chunks}</GhButton>,
                commit: chunks => <GhButton>{chunks}</GhButton>,
              })}
            </Text>
          </Step>

          <Step n={4}>
            <Text size="sm">
              {t.rich('step_pr_hint', {
                propose: chunks => <GhButton>{chunks}</GhButton>,
                create: chunks => <GhButton>{chunks}</GhButton>,
              })}
            </Text>
          </Step>
        </Stack>
      </Stack>
    </Paper>
  )
}
