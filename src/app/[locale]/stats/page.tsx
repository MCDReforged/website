import { LineChart } from "@/components/charts/line";
import { Counts, NestedCounts, PieChart } from "@/components/charts/pie";
import { CommonContentLayout } from "@/components/layout/common-content-layout";
import { TimeFormatted } from "@/components/time-formatted";
import { getTelemetryApiToken } from "@/utils/environment-utils";
import { pick } from "@/utils/i18n-utils";
import { getCountryCodeName } from "@/utils/iso-3166-utils";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import React from "react";

function getSecondsUntilNextHour(): number {
  const now = new Date()
  return 3600 - (now.getMinutes() * 60 + now.getSeconds())
}

async function mapCountryCode(counts: Counts): Promise<Counts> {
  const newCounts: Counts = {}
  for (const [code, value] of Object.entries(counts)) {
    const newCode = await getCountryCodeName(code) || code
    newCounts[newCode] = value
  }
  return newCounts
}

export default async function Page() {
  const locale = await getLocale()
  const messages = await getMessages()
  const t = await getTranslations('page.stats')

  const url = 'https://telemetry.mcdreforged.com/api/data'
  const fetchRsp = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${getTelemetryApiToken()}`,
    },
    next: {
      revalidate: Math.min(10 * 60, getSecondsUntilNextHour() + 30),
      tags: ['telemetry'],
    },
  })
  if (fetchRsp.status !== 200) {
    console.error(`fetch telemetry data failed: ${fetchRsp.status} ${fetchRsp.statusText}`, fetchRsp)
    return <div>Telemetry data fetching failed</div>
  }
  const rsp = (await fetchRsp.json()) as GetDataResponse

  const mcdrInstancesTimstamps = rsp.data['mcdr_instance'][0].timestamps
  const mcdrInstancesValues: {[label: string]: number[]} = {}
  mcdrInstancesValues[t('line.total')] = rsp.data['mcdr_instance'][0].values
  rsp.data['mcdr_version'].forEach(dataList => {
    if (dataList.subkey) {
      const points = new Map(dataList.timestamps.map((ts, index) => [ts, dataList.values[index]]))
      mcdrInstancesValues[dataList.subkey] = mcdrInstancesTimstamps.map(ts => (points.get(ts) || 0))
    }
  })

  function extractCount(kind: string): NestedCounts {
    let counts: NestedCounts = {
      keyCounts: {},
      subkeyCounts: {},
    }
    rsp.data[kind].forEach(dataList => {
      const key = dataList.key
      const subkey = dataList.subkey
      if (!key) {
        return
      }
      if (dataList.timestamps[dataList.timestamps.length - 1] !== rsp.end) {
        return
      }
      const value = dataList.values[dataList.values.length - 1]
      counts.keyCounts[key] = (counts.keyCounts[key] || 0) + value
      if (subkey) {
        if (!counts.subkeyCounts[key]) {
          counts.subkeyCounts[key] = {}
        }
        counts.subkeyCounts[key][subkey] = value
      }
    })
    return counts
  }

  // XXX: debug only
  function HourLine({label, timestamp}: {label: string; timestamp: number}) {
    return (
      <p>
        <span>{label}</span>
        <TimeFormatted date={new Date(timestamp)} format="LLL" hoverOpenDelay={500} component="span"/>
      </p>
    )
  }

  const countryCounts = extractCount('country')
  countryCounts.keyCounts = await mapCountryCode(countryCounts.keyCounts)

  return (
    <CommonContentLayout>
      <NextIntlClientProvider locale={locale} messages={pick(messages, 'page.stats')}>
        <div>
          <HourLine label="Start: " timestamp={rsp.start * 1000}/>
          <HourLine label="End: " timestamp={rsp.end * 1000}/>
          <p>Hour count: {(rsp.end - rsp.start) / 3600 + 1}</p>
        </div>
        <div className="flex flex-col gap-10">
          <LineChart title={t('kind.mcdr_instance')} timestamps={mcdrInstancesTimstamps} values={mcdrInstancesValues}/>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 flex-wrap lg:mx-20">
            <PieChart title={t('kind.mcdr_version')} counts={extractCount('mcdr_version')}/>
            <PieChart title={t('kind.python_version')} counts={extractCount('python_version')}/>
            <PieChart title={t('kind.system_version')} counts={extractCount('system_version')}/>
            <PieChart title={t('kind.system_arch')} counts={extractCount('system_arch')}/>
            <PieChart title={t('kind.deployment_method')} counts={extractCount('deployment_method')}/>
            <PieChart title={t('kind.country')} counts={countryCounts}/>
          </div>
        </div>
      </NextIntlClientProvider>
    </CommonContentLayout>
  )
}
