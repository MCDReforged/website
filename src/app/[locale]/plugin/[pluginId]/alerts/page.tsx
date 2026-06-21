import { getPluginOr404 } from "@/catalogue/data";
import { AllOfAPlugin, PluginUpdateReportEntry } from "@/catalogue/meta-types";
import { hasPluginUpdateReportEntries } from "@/catalogue/update-report";
import { Icon, IconAlertCircle, IconAlertTriangle } from "@tabler/icons-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import React from "react";

type ReportKind = 'failure' | 'warning'

interface ReportKindConfig {
  icon: Icon
  color: string
}

const reportKindConfig: Record<ReportKind, ReportKindConfig> = {
  failure: {
    icon: IconAlertCircle,
    color: 'var(--mantine-color-red-6)',
  },
  warning: {
    icon: IconAlertTriangle,
    color: 'var(--mantine-color-yellow-6)',
  },
}

interface ReportEntryTexts {
  errorType: string
  errorMessage: string
}

function ReportEntry({entry, kind, texts}: { entry: PluginUpdateReportEntry, kind: ReportKind, texts: ReportEntryTexts }) {
  const cfg = reportKindConfig[kind]

  return (
    <li className="border-l-4 py-2 pl-3" style={{borderColor: cfg.color}}>
      <p className="whitespace-pre-wrap wrap-break-word font-medium">{entry.message}</p>
      {(entry.error_type || entry.error_message) && (
        <dl className="mt-2 grid gap-x-3 gap-y-1 text-sm sm:grid-cols-[max-content_1fr]">
          {entry.error_type && (
            <>
              <dt className="text-mantine-dimmed">{texts.errorType}</dt>
              <dd>
                <code className="break-all">{entry.error_type}</code>
              </dd>
            </>
          )}
          {entry.error_message && (
            <>
              <dt className="text-mantine-dimmed">{texts.errorMessage}</dt>
              <dd className="whitespace-pre-wrap wrap-break-word">{entry.error_message}</dd>
            </>
          )}
        </dl>
      )}
    </li>
  )
}

function ReportSection({title, entries, kind, texts}: { title: string, entries: PluginUpdateReportEntry[], kind: ReportKind, texts: ReportEntryTexts }) {
  if (entries.length === 0) {
    return null
  }

  const cfg = reportKindConfig[kind]
  const IconComponent = cfg.icon

  return (
    <section>
      <div className="mb-3 flex items-center gap-2" style={{color: cfg.color}}>
        <IconComponent size={20} stroke={1.8}/>
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="rounded-sm border px-1.5 py-0.5 text-xs leading-none" style={{borderColor: cfg.color}}>
          {entries.length}
        </span>
      </div>
      <ol className="flex flex-col gap-3">
        {entries.map((entry, index) => (
          <ReportEntry key={index} entry={entry} kind={kind} texts={texts}/>
        ))}
      </ol>
    </section>
  )
}

async function PageContent({plugin}: { plugin: AllOfAPlugin }) {
  const t = await getTranslations('page.plugin.update_report')
  const report = plugin.update_report

  if (!report || !hasPluginUpdateReportEntries(report)) {
    return null
  }

  const texts = {
    errorType: t('error_type'),
    errorMessage: t('error_message'),
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="rounded-sm border px-3 py-2 text-sm text-mantine-dimmed" style={{borderColor: 'var(--mantine-color-default-border)'}}>
        {t('note')}
      </p>
      <ReportSection title={t('failures')} entries={report.failures} kind="failure" texts={texts}/>
      <ReportSection title={t('warnings')} entries={report.warnings} kind="warning" texts={texts}/>
    </div>
  )
}

export default async function Page(props: { params: Promise<{ pluginId: string, locale: string }> }) {
  const {pluginId, locale} = await props.params

  setRequestLocale(locale);
  const plugin = await getPluginOr404(pluginId)

  return (
    <PageContent plugin={plugin}/>
  )
}
