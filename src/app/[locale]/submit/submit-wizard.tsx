'use client'

import { toPluginRelative } from '@/submit/plugin-path-utils'
import { buildForkUrl, buildNewFileUrl, buildPluginInfoJson, ownerAuthor, parseRepoSpec } from '@/submit/github-repo-utils'
import { GithubApiError, GithubCompare, githubRequest, setGithubApiBase } from '@/submit/github'
import { getRepoDetail, resolvePluginCandidate } from '@/submit/repo'
import { firstExistingRawFile, rawFileExists } from '@/submit/github'
import { buildPluginInfo, validateSubmission, validateWithoutApi } from '@/submit/validate'
import { ForkStatus, Guidelines, PluginInfoAuthor, RepoDetail, SubmitForm, SubmitIssue, ValidationResult } from '@/submit/types'
import { INTRODUCTION_LANGUAGES, PLUGIN_LABELS } from '@/submit/types'
import {
  Alert,
  Anchor,
  Autocomplete,
  Badge,
  Button,
  Code,
  Group,
  Loader,
  MultiSelect,
  Checkbox,
  Paper,
  Select,
  Divider,
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
  IconExternalLink,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import { GfmMarkdownDynamic } from '@/components/markdown/gfm-markdown-dynamic'
import { useLocale, useTranslations } from 'next-intl'
import { useMediaQuery } from '@mantine/hooks'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SubmissionReportView } from './submission-report'
import { SubmissionSteps } from './submission-steps'

const FORK_PROBE_FILES = ['README.md', 'readme.md', 'CONTRIBUTING.md', 'CONTRIBUTING_zh_cn.md']

const STEP_SELECT = 0
const STEP_GUIDELINES = 1
const STEP_DETAILS = 2
const STEP_REVIEW = 3

const CATALOGUE_BRANCH = 'master'

export function SubmitWizard({ guidelines, catalogueRepo, apiBase, catalogueIds }: {
  guidelines: Guidelines | null
  catalogueIds: string[]
  catalogueRepo: string
  apiBase: string
}) {
  const t = useTranslations('page.submit')
  const tLabel = useTranslations('component.plugin_label')
  const locale = useLocale()
  const isNarrow = useMediaQuery('(max-width: 48em)')

  const [repo, setRepo] = useState<string | null>(null)
  const [repoText, setRepoText] = useState('')
  const [detail, setDetail] = useState<RepoDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const detailRequestId = useRef(0)
  const resolveRequestId = useRef(0)

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
  const [skippedCheck, setSkippedCheck] = useState(false)
  const [idFromFile, setIdFromFile] = useState(false)
  const [login, setLogin] = useState('')
  const [forkStatus, setForkStatus] = useState<ForkStatus | null>(null)

  useEffect(() => { setGithubApiBase(apiBase) }, [apiBase])

  const loadForkStatus = useCallback(async (loginValue: string) => {
    const name = catalogueRepo.split('/')[1]
    const forkFullName = `${loginValue}/${name}`
    const isCatalogueItself = forkFullName.toLowerCase() === catalogueRepo.toLowerCase()
    const forkFile = isCatalogueItself
      ? null
      : await firstExistingRawFile(forkFullName, 'HEAD', FORK_PROBE_FILES)
    // a fork that is merely behind is harmless, but commits the catalogue lacks ride along
    let forkAheadBy = 0
    if (forkFile !== null) {
      const compare = await githubRequest<GithubCompare>(
        `/repos/${catalogueRepo}/compare/${CATALOGUE_BRANCH}`
        + `...${loginValue}:${CATALOGUE_BRANCH}`,
      ).catch(() => null)
      forkAheadBy = compare?.ahead_by ?? 0
    }

    setForkStatus({
      login: loginValue,
      forkExists: forkFile !== null,
      forkAheadBy,
    })
  }, [catalogueRepo])

  const describeError = useCallback((err: unknown, repo?: string | null) => {
    if (err instanceof GithubApiError) {
      if (err.rateLimited) {
        return t('rate_limited')
      }
      // github answers 404 for a missing repository and a private one alike
      if (err.status === 404 && repo) {
        return t('repo.not_found', { repo })
      }
      return t('api_unreachable')
    }
    if (err instanceof TypeError || (err instanceof DOMException && err.name === 'TimeoutError')) {
      return t('network_error')
    }
    return (err as Error).message
  }, [t])

  const [checkingFork, setCheckingFork] = useState(false)

  useEffect(() => {
    if (login.length === 0) {
      setForkStatus(null)
      setCheckingFork(false)
      return
    }
    // the run that set the flag may have been cancelled by this re-render, so clear it here
    if (forkStatus?.login === login) {
      setCheckingFork(false)
      return
    }
    let cancelled = false
    setCheckingFork(true)
    loadForkStatus(login)
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          setCheckingFork(false)
        }
      })
    return () => { cancelled = true }
  }, [login, forkStatus, loadForkStatus, describeError])

  const defaultAuthors = useCallback((repoFullName: string): PluginInfoAuthor[] => {
    const author = ownerAuthor(repoFullName)
    return author === null ? [] : [author]
  }, [])

  const resolveRelatedPath = useCallback(async (repoFullName: string, branchName: string, path: string) => {
    const requestId = ++resolveRequestId.current
    setResolving(true)
    setPluginIdError(null)
    try {
      const candidate = await resolvePluginCandidate(repoFullName, branchName, path, login)
      if (requestId !== resolveRequestId.current) {
        return
      }
      if (candidate?.metadata.id) {
        setPluginId(candidate.metadata.id)
        setAuthors(candidate.metadata.authors?.length ? candidate.metadata.authors : defaultAuthors(repoFullName))
        setIdFromFile(true)
        const ownReadme = path === '.' ? 'README.md' : `${path}/README.md`
        const hasReadme = await rawFileExists(repoFullName, branchName, ownReadme).catch(() => false)
        if (hasReadme) {
          setIntroduction(previous => previous.en_us ? previous : { ...previous, en_us: 'README.md' })
        }
      } else {
        setPluginId('')
        setPluginIdError(candidate === null || candidate.error === 'unreadable' ? 'not_found' : 'invalid')
        setIdFromFile(false)
      }
    } catch (err) {
      if (requestId !== resolveRequestId.current) {
        return
      }
      setPluginId('')
      setPluginIdError(describeError(err, repoFullName))
    } finally {
      if (requestId === resolveRequestId.current) {
        setResolving(false)
      }
    }
  }, [login, describeError, defaultAuthors])

  const applyCandidate = useCallback((relatedPathValue: string, source: RepoDetail) => {
    setRelatedPath(relatedPathValue)
    const ownReadme = relatedPathValue === '.' ? 'README.md' : `${relatedPathValue}/README.md`
    if (source.mdFiles.includes(ownReadme)) {
      setIntroduction(previous => previous.en_us ? previous : { ...previous, en_us: 'README.md' })
    }
    void resolveRelatedPath(source.repo, source.branch, relatedPathValue)
  }, [resolveRelatedPath])


  const loadDetail = useCallback(async (repoFullName: string, branchName?: string | null) => {
    const requestId = ++detailRequestId.current
    setDetailLoading(true)
    setError(null)
    try {
      const data = await getRepoDetail(repoFullName, branchName ?? undefined)
      if (requestId !== detailRequestId.current) {
        return
      }
      setDetail(data)
      setBranch(data.branch)
      if (data.candidatePaths.length > 0) {
        applyCandidate(data.candidatePaths[0], data)
      } else {
        setRelatedPath(null)
      }
    } catch (err) {
      if (requestId !== detailRequestId.current) {
        return
      }
      setError(describeError(err, repoFullName))
      setDetail(null)
      const fallbackBranch = branchName ?? 'master'
      const fallbackPath = '.'
      setBranch(previous => previous ?? fallbackBranch)
      setRelatedPath(previous => previous ?? fallbackPath)
      setAuthors(previous => previous.length > 0 ? previous : defaultAuthors(repoFullName))
      void resolveRelatedPath(repoFullName, fallbackBranch, fallbackPath)
    } finally {
      if (requestId === detailRequestId.current) {
        setDetailLoading(false)
      }
    }
  }, [applyCandidate, describeError, defaultAuthors, resolveRelatedPath])

  const mdCandidates = React.useMemo(() => {
    if (detail === null || relatedPath === null || relatedPath.length === 0) {
      return []
    }
    return detail.mdFiles.map(path => toPluginRelative(relatedPath, path))
  }, [detail, relatedPath])

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
    setSkippedCheck(false)
    setIdFromFile(false)
  }, [])

  const onSelectRepo = useCallback((value: string) => {
    setRepo(value)
    setRepoText(value)
    clearSelection()
    setLogin(previous => previous.length > 0 ? previous : value.split('/')[0])
    loadDetail(value)
  }, [clearSelection, loadDetail])

  const onSelectBranch = useCallback((value: string | null) => {
    setBranch(value)
    if (repo && value) {
      loadDetail(repo, value)
    }
  }, [repo, loadDetail])

  const onRelatedPathBlur = useCallback(() => {
    if (!repo || !branch || !relatedPath) {
      return
    }
    void resolveRelatedPath(repo, branch, relatedPath)
  }, [repo, branch, relatedPath, resolveRelatedPath])

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
      setValidation(await validateSubmission(buildForm() as SubmitForm, catalogueRepo, catalogueIds))
      setSkippedCheck(false)
      setStep(STEP_REVIEW)
    } catch {
      setSkippedCheck(true)
      try {
        setValidation(await validateWithoutApi(buildForm() as SubmitForm, catalogueRepo, catalogueIds))
      } catch {
        setValidation(null)
      }
      setStep(STEP_REVIEW)
    } finally {
      setValidating(false)
    }
  }, [buildForm, catalogueRepo, catalogueIds])

  const guidelinesFile = guidelines?.fileName
    ?? (locale === 'zh-CN' ? 'CONTRIBUTING_zh_cn.md' : 'CONTRIBUTING.md')
  const guidelinesHref = guidelines !== null
    ? guidelines.baseUrl + guidelines.fileName
    : `https://github.com/${catalogueRepo}/blob/HEAD/${guidelinesFile}`

  const issues = (list: SubmitIssue[]) => (
    <Stack gap={4}>
      {list.map((issue, index) => (
        <Text key={index} size="sm">{t(`issues.${issue.code}`, issue.params)}</Text>
      ))}
    </Stack>
  )

  const canLeaveDetails = repo !== null && (branch ?? '').trim().length > 0 && relatedPath !== null
  const canCheck = canLeaveDetails && pluginId.trim().length > 0
  const pluginIdErrorMessage = pluginIdError === null ? undefined
    : pluginIdError === 'not_found' ? t('details.plugin_id_not_found')
      : pluginIdError === 'invalid' ? t('details.plugin_id_invalid')
        : pluginIdError

  const catalogueName = catalogueRepo.split('/')[1]
  const forkName = forkStatus !== null ? `${forkStatus.login}/${catalogueName}` : ''
  const pluginInfo = validation?.pluginInfo ?? (skippedCheck ? buildPluginInfo(buildForm() as SubmitForm) : null)
  const canSubmit = pluginInfo !== null && (validation === null || validation.errors.length === 0)
  const pluginInfoJson = pluginInfo !== null ? buildPluginInfoJson(pluginInfo) : null
  const submissionPath = pluginInfo !== null ? `plugins/${pluginInfo.id}/plugin_info.json` : ''
  const ownsCatalogue = login.length > 0
    && catalogueRepo.split('/')[0].toLowerCase() === login.toLowerCase()
  const targetRepo = forkStatus !== null
    ? (ownsCatalogue ? catalogueRepo : forkName)
    : (login.length > 0 ? `${login}/${catalogueName}` : '')
  const newFileUrl = canSubmit && pluginInfoJson !== null && submissionPath.length > 0 && targetRepo.length > 0
    ? buildNewFileUrl(targetRepo, CATALOGUE_BRANCH, submissionPath, pluginInfoJson)
    : null

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
                const parsed = parseRepoSpec(typed)
                if (parsed === null) {
                  setError(t('repo.invalid'))
                  return
                }
                onSelectRepo(parsed)
              }}
            />
            {detailLoading && <Loader size="sm"/>}

                {detail ? (
                  <>
                    <Select
                      label={t('repo.branch')}
                      data={detail.branches}
                      value={branch}
                      onChange={onSelectBranch}
                      searchable
                    />
                    {detail.candidatePaths.length > 0 ? (
                      <Autocomplete
                        label={t('repo.related_path')}
                        description={t('repo.related_path_hint')}
                        data={detail.candidatePaths}
                        value={relatedPath ?? ''}
                        onChange={value => {
                          setPluginIdError(null)
                          if (value.length === 0) {
                            setRelatedPath(null)
                            return
                          }
                          applyCandidate(value, detail)
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
                    {detail.candidatePaths.length === 0 && (
                      <Alert color="yellow" icon={<IconAlertTriangle/>}>{t('repo.no_candidates')}</Alert>
                    )}
                    {detail.candidatesTruncated && <Text size="xs" c="dimmed">{t('repo.candidates_truncated')}</Text>}
                    {detail.treeTruncated && <Text size="xs" c="dimmed">{t('repo.tree_truncated')}</Text>}
                  </>
                ) : repo !== null && !detailLoading ? (
                  <>
                    {/* the repository could not be read, so the fields are typed in by hand: none of
                        this is needed to create the file on github.com */}
                    <Alert color="yellow" icon={<IconAlertTriangle/>} p="xs">
                      <Text size="xs">{t('repo.manual_notice')}</Text>
                    </Alert>
                    <TextInput
                      label={t('repo.branch')}
                      description={t('repo.branch_hint')}
                      value={branch ?? ''}
                      onChange={event => setBranch(event.currentTarget.value.trim())}
                      onBlur={event => {
                        const value = event.currentTarget.value.trim()
                        if (repo !== null && value.length > 0) {
                          void resolveRelatedPath(repo, value, relatedPath ?? '.')
                        }
                      }}
                      required
                    />
                    <TextInput
                      label={t('repo.related_path')}
                      description={t('repo.related_path_hint')}
                      value={relatedPath ?? ''}
                      onChange={event => setRelatedPath(event.currentTarget.value.length === 0 ? null : event.currentTarget.value)}
                      required
                    />
                  </>
                ) : null}

                {/* the fork has to live under the submitter's own account, and the plugin
                    repository's owner is that account in almost every case. It stays visible even
                    when nothing could be read, because the file link is built from it. */}
                {repo !== null && (
                  <>
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
                  </>
                )}

                {/* the plugin id itself lives two steps ahead, so the reason the next button is
                    disabled has to be shown here, next to the directory that was picked */}
                {pluginIdErrorMessage !== undefined && (
                  <Alert color="yellow" icon={<IconAlertTriangle/>}>{pluginIdErrorMessage}</Alert>
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
                  <GfmMarkdownDynamic relativeLinkBase={guidelines.baseUrl} relativeImageBase={guidelines.rawBaseUrl} allowEmbedHtml allowAnchor>
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
              description={t(idFromFile ? 'details.plugin_id_hint' : 'details.plugin_id_hint_manual')}
              value={pluginId}
              readOnly={idFromFile}
              onChange={event => setPluginId(event.currentTarget.value.trim())}
              placeholder={idFromFile ? t('details.plugin_id_placeholder') : t('details.plugin_id_manual_placeholder')}
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
              <Button onClick={goToReview} disabled={!canCheck} loading={validating}>{t('actions.check')}</Button>
            </Group>
          </Stack>
        </Stepper.Step>

        <Stepper.Step label={t('steps.review')}>
          <Stack gap="md" mt="md">
                {skippedCheck && (
                  <Alert color="yellow" icon={<IconAlertTriangle/>} title={t('review.skipped_title')}>
                    {t('review.skipped')}
                  </Alert>
                )}
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
                      : <Text size="sm" c="dimmed">{t(skippedCheck ? 'review.skipped_report' : 'review.unavailable')}</Text>}
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

                {/* Every step below happens in github's own interface, and none of it needs a
                    credential: the wizard only says which buttons to press, and where. */}
                {canSubmit && pluginInfoJson !== null ? (
                  <SubmissionSteps
                    catalogueRepo={catalogueRepo}
                    forkName={forkName}
                    forkExists={forkStatus?.forkExists === true}
                    forkAheadBy={forkStatus?.forkAheadBy ?? 0}
                    forkUrl={buildForkUrl(catalogueRepo)}
                    fileUrl={newFileUrl}
                    path={submissionPath}
                    jsonValue={pluginInfoJson}
                  />
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
