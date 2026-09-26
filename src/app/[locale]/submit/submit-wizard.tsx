'use client'

import { toPluginRelative } from '@/utils/plugin-path-utils'
import { buildForkUrl, buildNewFileUrl, buildPluginInfoJson, parseRepoSpec } from '@/utils/github-repo-utils'
import { GithubApiError, setGithubApiBase } from '@/utils/github-api'
import { getRepoDetail, getRepoInfo, resolvePluginCandidate, tryGetRepo } from '@/submit/repo'
import { validateSubmission } from '@/submit/validate'
import { ForkStatus, Guidelines, PluginInfoAuthor, RepoDetail, SubmitForm, SubmitIssue, ValidationResult } from '@/submit/types'
import { INTRODUCTION_LANGUAGES, PLUGIN_LABELS } from '@/submit/types'
import {
  Alert,
  Anchor,
  Autocomplete,
  Badge,
  Button,
  Code,
  CopyButton,
  Divider,
  Group,
  Loader,
  MultiSelect,
  Checkbox,
  Paper,
  Select,
  Stack,
  Stepper,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import {
  IconAlertTriangle,
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconFileText,
  IconGitFork,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import { GfmMarkdownDynamic } from '@/components/markdown/gfm-markdown-dynamic'
import { useLocale, useTranslations } from 'next-intl'
import { useMediaQuery } from '@mantine/hooks'
import React, { useCallback, useEffect, useState } from 'react'
import { SubmissionReportView } from './submission-report'

const STEP_SELECT = 0
const STEP_GUIDELINES = 1
const STEP_DETAILS = 2
const STEP_REVIEW = 3

export function SubmitWizard({ guidelines, enabled, catalogueRepo, apiBase }: {
  guidelines: Guidelines | null
  enabled: boolean
  /** the catalogue submissions are prepared for, e.g. `MCDReforged/PluginCatalogue` */
  catalogueRepo: string
  /** a self hosted github api, for deployments that do not talk to api.github.com */
  apiBase: string
}) {
  const t = useTranslations('page.submit')
  const tLabel = useTranslations('component.plugin_label')
  const locale = useLocale()
  // four labelled steps do not fit a phone in a row, they wrap into a ragged mess
  const isNarrow = useMediaQuery('(max-width: 48em)')

  const [repo, setRepo] = useState<string | null>(null)
  /** what is in the repository box, which may not be a repository yet */
  const [repoText, setRepoText] = useState('')
  const [detail, setDetail] = useState<RepoDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [branch, setBranch] = useState<string | null>(null)
  const [relatedPath, setRelatedPath] = useState<string | null>(null)
  const [pluginId, setPluginId] = useState('')
  const [pluginIdError, setPluginIdError] = useState<string | null>(null)
  const [resolving, setResolving] = useState(false)
  const [authors, setAuthors] = useState<PluginInfoAuthor[]>([])
  const [labels, setLabels] = useState<string[]>([])
  const [introduction, setIntroduction] = useState<Record<string, string>>({})

  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false)
  const [step, setStep] = useState(STEP_SELECT)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  /** the github account that will own the fork, taken from the plugin repository unless edited */
  const [login, setLogin] = useState('')
  /** where that account's fork of the catalogue stands */
  const [forkStatus, setForkStatus] = useState<ForkStatus | null>(null)

  // every github request is made by the browser itself, with no credential of any kind
  useEffect(() => { setGithubApiBase(apiBase) }, [apiBase])

  /**
   * Figures out where the submitter's fork stands, so the file link can point at the right
   * repository, and so an existing fork can be reused instead of forking a second time.
   */
  const loadForkStatus = useCallback(async (loginValue: string) => {
    const name = catalogueRepo.split('/')[1]
    const forkFullName = `${loginValue}/${name}`
    const isCatalogueItself = forkFullName.toLowerCase() === catalogueRepo.toLowerCase()
    const [catalogue, fork] = await Promise.all([
      getRepoInfo(catalogueRepo),
      // the owner of the catalogue has nothing to fork, and no fork to look up
      isCatalogueItself ? Promise.resolve(null) : tryGetRepo(forkFullName),
    ])
    setForkStatus({
      login: loginValue,
      forkExists: fork !== null,
      forkOfCatalogue: fork?.parent?.full_name?.toLowerCase() === catalogueRepo.toLowerCase(),
      branch: catalogue.default_branch,
    })
  }, [catalogueRepo])

  const describeError = useCallback((err: unknown) => err instanceof GithubApiError && err.rateLimited
    ? t('rate_limited')
    : (err as Error).message, [t])

  const [checkingFork, setCheckingFork] = useState(false)

  // the login is usually inferred from the plugin repository, so this cannot wait for a blur
  useEffect(() => {
    if (login.length === 0) {
      setForkStatus(null)
      return
    }
    if (forkStatus?.login === login) {
      return
    }
    let cancelled = false
    setCheckingFork(true)
    loadForkStatus(login)
      .catch(err => {
        if (!cancelled) {
          setError(describeError(err))
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCheckingFork(false)
        }
      })
    return () => { cancelled = true }
  }, [login, forkStatus, loadForkStatus, describeError])

  // ---- repository detail ---- //
  const applyCandidate = useCallback((relatedPathValue: string, source: RepoDetail) => {
    setRelatedPath(relatedPathValue)
    const candidate = source.candidates.find(c => c.relatedPath === relatedPathValue)
    // always overwritten: switching to a candidate without a usable id must not keep the previous one
    setPluginId(candidate?.metadata.id ?? '')
    setPluginIdError(candidate !== undefined && !candidate.validId ? 'invalid' : null)
    setAuthors(candidate?.metadata.authors ?? [])

    // the catalogue recommends pointing the introduction at the plugin's own readme
    const ownReadme = relatedPathValue === '.' ? 'README.md' : `${relatedPathValue}/README.md`
    if (source.mdFiles.includes(ownReadme)) {
      setIntroduction(previous => previous.en_us ? previous : { ...previous, en_us: 'README.md' })
    }
  }, [])

  const loadDetail = useCallback(async (repoFullName: string, branchName?: string | null) => {
    setDetailLoading(true)
    setError(null)
    try {
      const data = await getRepoDetail(repoFullName, branchName ?? undefined, login)
      setDetail(data)
      setBranch(data.branch)
      if (data.candidates.length > 0) {
        applyCandidate(data.candidates[0].relatedPath, data)
      } else {
        setRelatedPath(null)
      }
    } catch (err) {
      setError(describeError(err))
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }, [applyCandidate, login, describeError])

  /**
   * `introduction` values in `plugin_info.json` are relative to the plugin directory, so the picker
   * offers them in that form, including `../` for files outside of it.
   */
  const mdCandidates = React.useMemo(() => {
    if (detail === null || relatedPath === null || relatedPath.length === 0) {
      return []
    }
    return detail.mdFiles.map(path => toPluginRelative(relatedPath, path))
  }, [detail, relatedPath])

  /** Drops everything that belonged to the previous repository selection. */
  const clearSelection = useCallback(() => {
    setDetail(null)
    setBranch(null)
    setRelatedPath(null)
    setPluginId('')
    setPluginIdError(null)
    setAuthors([])
    setLabels([])
    setIntroduction({})
    setValidation(null)
  }, [])

  const onSelectRepo = useCallback((value: string) => {
    setRepo(value)
    setRepoText(value)
    clearSelection()
    // the plugin repository's owner is the submitter in almost every case, and it is what the
    // fork link needs; it stays editable for repositories living in an organization
    setLogin(previous => previous.length > 0 ? previous : value.split('/')[0])
    loadDetail(value)
  }, [clearSelection, loadDetail])

  const onSelectBranch = useCallback((value: string | null) => {
    setBranch(value)
    if (repo && value) {
      loadDetail(repo, value)
    }
  }, [repo, loadDetail])

  /**
   * The plugin id is never typed by hand: it is whatever the `mcdreforged.plugin.json` at
   * `relatedPath` declares, so a manually typed path has to be resolved against the repository.
   */
  const resolveRelatedPath = useCallback(async (repoFullName: string, branchName: string, path: string) => {
    setResolving(true)
    setPluginIdError(null)
    try {
      const candidate = await resolvePluginCandidate(repoFullName, branchName, path, login)
      if (candidate?.metadata.id) {
        setPluginId(candidate.metadata.id)
        setAuthors(candidate.metadata.authors ?? [])
      } else {
        setPluginId('')
        setPluginIdError(candidate === null ? 'not_found' : 'invalid')
      }
    } catch (err) {
      setPluginId('')
      setPluginIdError(describeError(err))
    } finally {
      setResolving(false)
    }
  }, [login, describeError])

  const onRelatedPathBlur = useCallback(() => {
    if (!repo || !branch || !relatedPath) {
      return
    }
    if (detail?.candidates.some(c => c.relatedPath === relatedPath)) {
      return
    }
    void resolveRelatedPath(repo, branch, relatedPath)
  }, [repo, branch, relatedPath, detail, resolveRelatedPath])

  // ---- form ---- //
  const buildForm = useCallback(() => ({
    repo,
    branch,
    relatedPath: relatedPath ?? '.',
    id: pluginId,
    authors,
    labels,
    introduction,
  }), [repo, branch, relatedPath, pluginId, authors, labels, introduction])

  const goToReview = useCallback(async () => {
    setValidating(true)
    setError(null)
    try {
      setValidation(await validateSubmission(buildForm() as SubmitForm, catalogueRepo))
      setStep(STEP_REVIEW)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setValidating(false)
    }
  }, [buildForm, catalogueRepo, describeError])

  // the catalogue ships one guideline file per language; prefer the one the server could actually load
  const guidelinesFile = guidelines?.fileName
    ?? (locale === 'zh-CN' ? 'CONTRIBUTING_zh_cn.md' : 'CONTRIBUTING.md')
  const guidelinesHref = guidelines !== null
    ? guidelines.baseUrl + guidelines.fileName
    : `https://github.com/${catalogueRepo}/blob/HEAD/${guidelinesFile}`

  // ---- render helpers ---- //
  const issues = (list: SubmitIssue[]) => (
    <Stack gap={4}>
      {list.map((issue, index) => (
        <Text key={index} size="sm">{t(`issues.${issue.code}`, issue.params)}</Text>
      ))}
    </Stack>
  )

  const canLeaveDetails = repo !== null && branch !== null && relatedPath !== null && pluginId.trim().length > 0
  const pluginIdErrorMessage = pluginIdError === null ? undefined
    : pluginIdError === 'not_found' ? t('details.plugin_id_not_found')
      : pluginIdError === 'invalid' ? t('details.plugin_id_invalid')
        : pluginIdError

  // ---- handing the commit over to github ---- //
  const catalogueName = catalogueRepo.split('/')[1]
  const forkName = forkStatus !== null ? `${forkStatus.login}/${catalogueName}` : ''
  const canSubmit = validation !== null && validation.errors.length === 0 && validation.pluginInfo !== null
  // the json is written the way the catalogue already formats its files
  const pluginInfoJson = validation?.pluginInfo ? buildPluginInfoJson(validation.pluginInfo) : null
  const submissionPath = validation?.pluginInfo ? `plugins/${validation.pluginInfo.id}/plugin_info.json` : ''
  // the catalogue's owner needs no fork: forking a repository you own is not possible, and the
  // file can be created there directly. Everyone else commits to their own fork.
  const ownsCatalogue = forkStatus !== null
    && catalogueRepo.split('/')[0].toLowerCase() === forkStatus.login.toLowerCase()
  const targetRepo = ownsCatalogue ? catalogueRepo : forkName
  const newFileUrl = canSubmit && pluginInfoJson !== null && submissionPath.length > 0 && forkStatus !== null
    ? buildNewFileUrl(targetRepo, forkStatus.branch, submissionPath, pluginInfoJson)
    : null

  if (!enabled) {
    return <Alert color="yellow" icon={<IconAlertTriangle/>}>{t('disabled')}</Alert>
  }

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>{t('title')}</Title>
        <Text c="dimmed" mt={4}>{t('description')}</Text>
        <Text c="dimmed" size="sm" mt={4}>
          {t('target', { repo: catalogueRepo })}
        </Text>
      </div>

      {error && (
        <Alert color="red" icon={<IconAlertTriangle/>} withCloseButton onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stepper
        active={step}
        onStepClick={setStep}
        allowNextStepsSelect={false}
        orientation={isNarrow ? 'vertical' : 'horizontal'}
      >
        <Stepper.Step label={t('steps.select')} allowStepClick={false}>
          <Stack gap="md" mt="md">
            {/* a plain field: there is no credential, so the repository is either pasted as a url
                or typed as owner/name; both are understood */}
            <TextInput
              label={t('repo.select')}
              description={t('repo.select_hint')}
              placeholder={t('repo.search_placeholder')}
              value={repoText}
              onChange={event => {
                const value = event.currentTarget.value
                setRepoText(value)
                if (value !== repo) {
                  setRepo(null)
                  clearSelection()
                }
              }}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.currentTarget.blur()
                }
              }}
              onBlur={event => {
                const typed = event.currentTarget.value.trim()
                if (typed.length === 0 || typed === repo) {
                  return
                }
                // a pasted url names the same repository, reduce it to owner/repository
                const parsed = parseRepoSpec(typed)
                if (parsed === null) {
                  setError(t('repo.invalid'))
                  return
                }
                onSelectRepo(parsed)
              }}
            />
            {detailLoading && <Loader size="sm"/>}


                {detail && (
                  <>
                    <Select
                      label={t('repo.branch')}
                      data={detail.branches}
                      value={branch}
                      onChange={onSelectBranch}
                      searchable
                    />
                    {detail.candidates.length > 0 ? (
                      <Autocomplete
                        label={t('repo.related_path')}
                        description={t('repo.related_path_hint')}
                        data={detail.candidates.map(c => c.relatedPath)}
                        value={relatedPath ?? ''}
                        onChange={value => {
                          setPluginIdError(null)
                          if (value.length === 0) {
                            setRelatedPath(null)
                            return
                          }
                          if (detail.candidates.some(c => c.relatedPath === value)) {
                            applyCandidate(value, detail)
                          } else {
                            setRelatedPath(value)
                          }
                        }}
                        onBlur={onRelatedPathBlur}
                      />
                    ) : (
                      <Autocomplete
                        label={t('repo.related_path')}
                        description={t('repo.related_path_hint')}
                        data={[]}
                        value={relatedPath ?? ''}
                        onChange={value => {
                          setPluginIdError(null)
                          setRelatedPath(value.length === 0 ? null : value)
                        }}
                        onBlur={onRelatedPathBlur}
                      />
                    )}
                    {detail.candidates.length === 0 && (
                      <Alert color="yellow" icon={<IconAlertTriangle/>}>{t('repo.no_candidates')}</Alert>
                    )}
                    {/* the fork has to live under the submitter's own account, and the plugin
                        repository's owner is that account in almost every case */}
                    <TextInput
                      label={t('repo.login')}
                      description={t('repo.login_hint')}
                      value={login}
                      onChange={event => {
                        setLogin(event.currentTarget.value.trim())
                        setForkStatus(null)
                      }}
                    />
                    {checkingFork && <Loader size="sm"/>}
                    {/* the plugin id itself lives two steps ahead, so the reason the next button is
                        disabled has to be shown here, next to the directory that was picked */}
                    {pluginIdErrorMessage !== undefined && (
                      <Alert color="yellow" icon={<IconAlertTriangle/>}>{pluginIdErrorMessage}</Alert>
                    )}
                    {detail.candidatesTruncated && <Text size="xs" c="dimmed">{t('repo.candidates_truncated')}</Text>}
                    {detail.treeTruncated && <Text size="xs" c="dimmed">{t('repo.tree_truncated')}</Text>}
                  </>
                )}

            <Group>
              <Button onClick={() => setStep(STEP_GUIDELINES)} disabled={!canLeaveDetails}>{t('actions.next')}</Button>
            </Group>
          </Stack>
        </Stepper.Step>

        <Stepper.Step label={t('steps.guidelines')}>
          <Stack gap="md" mt="md">
            <Text size="sm" c="dimmed">{t('guidelines.hint')}</Text>
            {guidelines !== null && (
              <Paper withBorder className="overflow-hidden">
                <div className="max-h-[60vh] overflow-y-auto p-4">
                  <GfmMarkdownDynamic relativeLinkBase={guidelines.baseUrl} allowEmbedHtml allowAnchor>
                    {guidelines.markdown}
                  </GfmMarkdownDynamic>
                </div>
              </Paper>
            )}
            <Anchor
              href={guidelinesHref}
              target="_blank"
              rel="noreferrer noopener"
              size="sm"
              w="fit-content"
            >
              {t(guidelines === null ? 'guidelines.link' : 'guidelines.source', { file: guidelinesFile })}
              <IconExternalLink size={14} className="inline align-baseline ml-1"/>
            </Anchor>
            <Checkbox
              checked={guidelinesAccepted}
              onChange={event => setGuidelinesAccepted(event.currentTarget.checked)}
              label={t('guidelines.ack')}
            />
            <Group>
              <Button variant="default" onClick={() => setStep(STEP_SELECT)}>{t('actions.back')}</Button>
              <Button onClick={() => setStep(STEP_DETAILS)} disabled={!guidelinesAccepted}>{t('actions.next')}</Button>
            </Group>
          </Stack>
        </Stepper.Step>

        <Stepper.Step label={t('steps.details')}>
          <Stack gap="md" mt="md">
            <TextInput
              label={t('details.plugin_id')}
              description={t('details.plugin_id_hint')}
              value={pluginId}
              readOnly
              placeholder={t('details.plugin_id_placeholder')}
              error={pluginIdErrorMessage}
              rightSection={resolving ? <Loader size="xs"/> : undefined}
              required
            />

            <div>
              <Stack gap="xs" mt={4}>
                {authors.map((author, index) => (
                  <Group key={index} align="flex-end" gap="xs" wrap={isNarrow ? 'wrap' : 'nowrap'}>
                    <TextInput
                      label={index === 0 || isNarrow ? t('details.authors') : undefined}
                      value={author.name}
                      onChange={event => setAuthors(previous => previous.map((a, i) => i === index ? { ...a, name: event.currentTarget.value } : a))}
                      style={{ flex: 1, minWidth: isNarrow ? '100%' : undefined }}
                      required
                    />
                    <TextInput
                      label={index === 0 || isNarrow ? t('details.author_link') : undefined}
                      value={author.link ?? ''}
                      onChange={event => setAuthors(previous => previous.map((a, i) => i === index ? { ...a, link: event.currentTarget.value } : a))}
                      style={{ flex: 1, minWidth: isNarrow ? '100%' : undefined }}
                    />
                    <Button
                      variant="subtle"
                      color="red"
                      className={isNarrow ? 'ml-auto' : undefined}
                      onClick={() => setAuthors(previous => previous.filter((_, i) => i !== index))}
                      aria-label={t('details.remove_author')}
                    >
                      <IconTrash size={16}/>
                    </Button>
                  </Group>
                ))}
                <Button
                  variant="light"
                  size="xs"
                  w="fit-content"
                  leftSection={<IconPlus size={14}/>}
                  onClick={() => setAuthors(previous => [...previous, { name: '', link: '' }])}
                >
                  {t('details.add_author')}
                </Button>
              </Stack>
            </div>

            <MultiSelect
              label={t('details.labels')}
              description={t('details.labels_hint')}
              data={PLUGIN_LABELS.map(label => ({ value: label, label: tLabel(`name.${label}`) }))}
              value={labels}
              onChange={setLabels}
              clearable
              renderOption={({ option, checked }) => (
                <Group gap="xs" wrap="nowrap" align="flex-start">
                  <span className="w-[14px] shrink-0 pt-[2px]">{checked ? <IconCheck size={14}/> : null}</span>
                  <div>
                    <Text size="sm">{option.label}</Text>
                    <Text size="xs" c="dimmed">{tLabel(`description.${option.value}`)}</Text>
                  </div>
                </Group>
              )}
              required
            />

            <div>
              <Text size="sm" fw={600}>{t('details.introduction')}<span className="text-red"> *</span></Text>
              <Text size="xs" c="dimmed" mb={4}>{t('details.introduction_hint')}</Text>
              <Stack gap="xs">
                {INTRODUCTION_LANGUAGES.map(language => (
                  <Autocomplete
                    key={language}
                    label={t(`details.introduction_lang.${language}`)}
                    data={mdCandidates}
                    value={introduction[language] ?? ''}
                    onChange={value => setIntroduction(previous => {
                      const next = { ...previous }
                      const trimmed = value.trim()
                      if (trimmed.length > 0) {
                        next[language] = trimmed
                      } else {
                        delete next[language]
                      }
                      return next
                    })}
                    clearable
                    placeholder={t('details.introduction_placeholder')}
                  />
                ))}
              </Stack>
            </div>

            <Group>
              <Button variant="default" onClick={() => setStep(STEP_SELECT)}>{t('actions.back')}</Button>
              <Button onClick={goToReview} disabled={!canLeaveDetails} loading={validating}>{t('actions.check')}</Button>
            </Group>
          </Stack>
        </Stepper.Step>

        <Stepper.Step label={t('steps.review')}>
          <Stack gap="md" mt="md">
                {validation && validation.errors.length > 0 && (
                  <Alert color="red" title={t('review.errors')} icon={<IconAlertTriangle/>}>
                    {issues(validation.errors)}
                  </Alert>
                )}
                {validation && validation.warnings.length > 0 && (
                  <Alert color="yellow" title={t('review.warnings')} icon={<IconAlertTriangle/>}>
                    {issues(validation.warnings)}
                  </Alert>
                )}

                <Tabs defaultValue="report">
                  <Tabs.List>
                    <Tabs.Tab value="report">{t('review.tab_report')}</Tabs.Tab>
                    <Tabs.Tab value="json">{t('review.tab_json')}</Tabs.Tab>
                  </Tabs.List>

                  <Tabs.Panel value="report" pt="md">
                    {validation?.report
                      ? <SubmissionReportView report={validation.report} errors={validation.errors} warnings={validation.warnings}/>
                      : <Text size="sm" c="dimmed">{t('review.unavailable')}</Text>}
                  </Tabs.Panel>

                  <Tabs.Panel value="json" pt="md">
                    {pluginInfoJson !== null ? (
                      <Paper withBorder p="md">
                        <Group justify="space-between" mb="xs">
                          <Text fw={500}>{t('review.preview')}</Text>
                          <Badge variant="light" tt="none">{submissionPath}</Badge>
                        </Group>
                        <Code block>{pluginInfoJson}</Code>
                      </Paper>
                    ) : (
                      <Text size="sm" c="dimmed">{t('review.unavailable')}</Text>
                    )}
                  </Tabs.Panel>
                </Tabs>

                {/* The commit itself happens on github.com: this app never asks for write access,
                    so the pull request is opened by the user in github's own editor. */}
                {canSubmit && pluginInfoJson !== null ? (
                  <Paper withBorder p="md">
                    <Stack gap="sm">
                      <Text fw={500}>{t('submit.title')}</Text>

                      {ownsCatalogue ? (
                        <Text size="sm">{t('submit.direct_hint', { repo: catalogueRepo })}</Text>
                      ) : (
                        <div>
                          <Text size="sm" fw={500}>{t('submit.fork_step', { repo: catalogueRepo })}</Text>
                          {forkStatus?.forkExists && forkStatus.forkOfCatalogue ? (
                            <Text size="sm" c="dimmed">{t('submit.fork_exists', { repo: forkName })}</Text>
                          ) : (
                            <Stack gap="xs" mt={4} align="flex-start">
                              <Button
                                component="a"
                                href={buildForkUrl(catalogueRepo)}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="light"
                                leftSection={<IconGitFork size={18}/>}
                                rightSection={<IconExternalLink size={16}/>}
                              >
                                {t('submit.fork_button')}
                              </Button>
                              {forkStatus?.forkExists && !forkStatus.forkOfCatalogue && (
                                <Alert color="yellow" icon={<IconAlertTriangle/>} p="xs">
                                  {t('submit.fork_conflict', { repo: forkName })}
                                </Alert>
                              )}
                            </Stack>
                          )}
                      </div>
                      )}
                      <div>
                        <Text size="sm" fw={500}>{t('submit.file_step', { path: submissionPath, repo: targetRepo })}</Text>
                        {newFileUrl !== null ? (
                          <Group mt={4}>
                            <Button
                              component="a"
                              href={newFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              leftSection={<IconFileText size={18}/>}
                              rightSection={<IconExternalLink size={16}/>}
                            >
                              {t('submit.file_button')}
                            </Button>
                            <CopyButton value={pluginInfoJson} timeout={2000}>
                              {({ copied, copy }) => (
                                <Button
                                  variant="default"
                                  onClick={copy}
                                  leftSection={copied ? <IconCheck size={16}/> : <IconCopy size={16}/>}
                                >
                                  {copied ? t('submit.copied') : t('submit.copy')}
                                </Button>
                              )}
                            </CopyButton>
                          </Group>
                        ) : (
                          <Text size="sm" c="dimmed">{t('submit.loading')}</Text>
                        )}
                        <Text size="sm" c="dimmed" mt={4}>{t('submit.file_hint')}</Text>
                      </div>

                      {!ownsCatalogue && <Text size="xs" c="dimmed">{t('submit.order_hint')}</Text>}
                    </Stack>
                  </Paper>
                ) : (
                  <Alert color="gray" icon={<IconAlertTriangle/>}>{t('submit.blocked')}</Alert>
                )}

                <Group>
                  <Button variant="default" onClick={() => setStep(STEP_DETAILS)}>{t('actions.back')}</Button>
                </Group>
          </Stack>
        </Stepper.Step>

        <Stepper.Completed>
          <Divider my="md"/>
        </Stepper.Completed>
      </Stepper>
    </Stack>
  )
}
