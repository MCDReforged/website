'use client'

import {
  Alert,
  Anchor,
  Button,
  Code,
  CopyButton,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  useComputedColorScheme,
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

/** GitHub's own button green, light and dark. */
const GH_GREEN = { light: '#1f883d', dark: '#238636' }

/**
 * A GitHub button, drawn rather than linked.
 *
 * Every step below happens in github's interface, and a new user has to *find* the button we are
 * talking about, so the instructions show what it looks like instead of only naming it. These are
 * not interactive: the buttons this page actually offers are Mantine buttons.
 */
function GhButton({ children, caret = false, radio = false }: {
  children: React.ReactNode
  caret?: boolean
  radio?: boolean
}) {
  const scheme = useComputedColorScheme('light')
  return (
    <span
      className="inline-flex items-center gap-[3px] rounded-md px-[7px] py-[1px] text-[11px] font-semibold whitespace-nowrap"
      style={radio
        ? { border: '1px solid var(--mantine-color-default-border)' }
        : { backgroundColor: GH_GREEN[scheme], color: '#ffffff' }}
    >
      {radio && <span className="mr-[2px] inline-block h-[9px] w-[9px] rounded-full border-2 border-current"/>}
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

/** One numbered step: the badge on the left, the instructions on the right. */
function Step({ n, children }: { n: number, children: React.ReactNode }) {
  return (
    <Group align="flex-start" wrap="nowrap" gap="sm">
      <StepNumber n={n}/>
      <div className="min-w-0 flex-1">{children}</div>
    </Group>
  )
}

/**
 * The last step: everything that happens on github.com.
 *
 * None of it needs a credential — the catalogue's checks already ran, and what is left is telling
 * the user which buttons to press and where.
 */
export function SubmissionSteps({
  catalogueRepo,
  forkName,
  forkExists,
  forkAheadBy,
  forkUrl,
  fileUrl,
  path,
  jsonValue,
  directHint,
}: {
  catalogueRepo: string
  /** `{login}/{catalogueName}`, where the file has to end up */
  forkName: string
  forkExists: boolean
  /** commits in the fork that the catalogue does not have; they ride along into the pull request */
  forkAheadBy: number
  forkUrl: string
  /** `null` when no shortcut can be built: the manual path and the copy button still work */
  fileUrl: string | null
  path: string
  jsonValue: string
  /** shown instead of the fork step when the submitter owns the catalogue */
  directHint: string | null
}) {
  const t = useTranslations('page.submit.submit')
  // a branch named after the plugin, instead of github's `patch-1`
  const branchSuggestion = `submit/${path.split('/')[1] ?? 'plugin'}`

  return (
    <Paper withBorder p="md">
      <Stack gap="lg">
        <Text fw={500}>{t('title')}</Text>

        <Stack gap="lg">
          {directHint !== null ? (
            <Step n={1}>
              <Text size="sm">{directHint}</Text>
            </Step>
          ) : (
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
                    <Text size="xs" c="dimmed">{t('step_fork_or_open')}</Text>
                  </>
                )}
                {/* a fork that is behind is harmless — a pull request is diffed from the merge base —
                    but extra commits travel with it */}
                {forkAheadBy > 0 && (
                  <Alert color="yellow" icon={<IconAlertTriangle size={16}/>} p="xs">
                    <Text size="xs">{t('fork_ahead', { repo: forkName, count: forkAheadBy })}</Text>
                  </Alert>
                )}
              </Stack>
            </Step>
          )}

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

              <Divider label={t('or_manual')} labelPosition="left" my={2}/>

              <Text size="xs" c="dimmed">
                {t.rich('step_file_manual', {
                  addFile: chunks => <GhButton caret>{chunks}</GhButton>,
                  createFile: chunks => <GhButton>{chunks}</GhButton>,
                })}
              </Text>
              <Group gap="xs">
                <Text size="xs" c="dimmed">{t('path')}</Text>
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
            </Stack>
          </Step>

          <Step n={3}>
            <Text size="sm">
              {t.rich('step_commit_hint', {
                commit: chunks => <GhButton>{chunks}</GhButton>,
              })}
            </Text>
          </Step>

          <Step n={4}>
            <Text size="sm">
              {t.rich('step_pr_hint', {
                option: chunks => <GhButton radio>{chunks}</GhButton>,
                propose: chunks => <GhButton>{chunks}</GhButton>,
                create: chunks => <GhButton>{chunks}</GhButton>,
              })}
            </Text>
            <Group gap="xs" mt={6}>
              <Text size="xs" c="dimmed">{t('branch_hint')}</Text>
              <Code>{branchSuggestion}</Code>
            </Group>
          </Step>
        </Stack>

        <Text size="xs" c="dimmed">{t('no_permission_note')}</Text>

        <Anchor href={forkUrl} target="_blank" rel="noopener noreferrer" size="xs" w="fit-content">
          {t('open_on_github', { repo: forkName })}
          <IconExternalLink size={12} className="inline align-baseline ml-1"/>
        </Anchor>
      </Stack>
    </Paper>
  )
}
