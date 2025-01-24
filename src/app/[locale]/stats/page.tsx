import { getEverything } from "@/catalogue/data";
import { LineChart, LineChartValues } from "@/components/charts/line";
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

async function getLatestPluginDownloadCounts(): Promise<NestedCounts> {
  const everything = await getEverything()
  const counts: NestedCounts = { keyCounts: {}, subkeyCounts: {} }
  for (let [pluginId, plugin] of Object.entries(everything.plugins)) {
    counts.keyCounts[pluginId] = 0
    counts.subkeyCounts[pluginId] = {}
    for (let releaseInfo of (plugin.release?.releases || [])) {
      let downloadCount = releaseInfo.asset.download_count
      counts.keyCounts[pluginId] += downloadCount
      counts.subkeyCounts[pluginId][releaseInfo.meta.version] = downloadCount
    }
  }

  const topN = 20
  const topNPlugins = Object.entries(counts.keyCounts).sort((a, b) => a[1] - b[1]).reverse().slice(0, topN).map(([pluginId, _]) => pluginId)
  const topNCounts: NestedCounts = { keyCounts: {}, subkeyCounts: {} }
  for (let pluginId of topNPlugins) {
    topNCounts.keyCounts[pluginId] = counts.keyCounts[pluginId]
    topNCounts.subkeyCounts[pluginId] = counts.subkeyCounts[pluginId]
  }
  return topNCounts
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

  const mainTimestamps = rsp.data['mcdr_instance'][0].timestamps

  function extraLineChartSubkeyValues(key: string, keyType: 'key' | 'subkey', withTotal: boolean): LineChartValues {
    const values: LineChartValues = {}
    const sumValues = mainTimestamps.map(() => 0)
    if (withTotal) {
      values[t('line.total')] = sumValues
    }
    rsp.data[key].forEach(dataList => {
      const valueKey = keyType === 'key' ? dataList.key : dataList.subkey
      if (valueKey) {
        values[valueKey] ??= mainTimestamps.map(() => 0)
        const points = new Map(dataList.timestamps.map((ts, index) => [ts, dataList.values[index]]))
        mainTimestamps.forEach((ts, index) => {
          const y = points.get(ts) || 0
          values[valueKey][index] += y
          sumValues[index] += y
        })
      }
    })
    if (!withTotal) {
      Object.keys(values).forEach(valueKey => {
        values[valueKey] = values[valueKey].map((value, index) => value / sumValues[index])
      })
    }
    return values
  }

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

  const mcdrInstancesValues = extraLineChartSubkeyValues('mcdr_version', 'subkey', true)
  const pythonVersionValues = extraLineChartSubkeyValues('python_version', 'key', false)
  const systemVersionValues = extraLineChartSubkeyValues('system_version', 'key', false)

  const countryCounts = extractCount('country')
  countryCounts.keyCounts = await mapCountryCode(countryCounts.keyCounts)
  const pluginDownloadCounts = await getLatestPluginDownloadCounts()

  return (
    <CommonContentLayout>
      <NextIntlClientProvider locale={locale} messages={pick(messages, 'page.stats')}>
        <div>
          <HourLine label="Start: " timestamp={rsp.start * 1000}/>
          <HourLine label="End: " timestamp={rsp.end * 1000}/>
          <p>Hour count: {(rsp.end - rsp.start) / 3600 + 1}</p>
        </div>
        <div className="flex flex-col gap-10">
          <LineChart title={t('kind.mcdr_instance')} timestamps={mainTimestamps} values={mcdrInstancesValues}/>
          {/*<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">*/}
          {/*  <LineChart title={t('kind.python_version')} timestamps={mainTimestamps} values={pythonVersionValues} showLegend={false}/>*/}
          {/*  <LineChart title={t('kind.system_version')} timestamps={mainTimestamps} values={systemVersionValues} showLegend={false}/>*/}
          {/*</div>*/}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-wrap lg:mx-20">
            <PieChart title={t('kind.mcdr_version')} counts={extractCount('mcdr_version')}/>
            <PieChart title={t('kind.python_version')} counts={extractCount('python_version')}/>
            <PieChart title={t('kind.system_version')} counts={extractCount('system_version')}/>
            <PieChart title={t('kind.system_arch')} counts={extractCount('system_arch')}/>
            <PieChart title={t('kind.deployment_method')} counts={extractCount('deployment_method')}/>
            <PieChart title={t('kind.country')} counts={countryCounts}/>
            {/*<PieChart title={"plugin download"} counts={pluginDownloadCounts}/>*/}
          </div>
        </div>
      </NextIntlClientProvider>
    </CommonContentLayout>
  )
}
