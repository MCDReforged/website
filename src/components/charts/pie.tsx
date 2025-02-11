'use client'

import { arraySum } from "@/utils/math-utils";
import { ArcElement, CategoryScale, Chart, ChartDataset, DoughnutController, Legend, LinearScale, LineElement, PointElement, TimeScale, Title, Tooltip } from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import chroma from "chroma-js";
import { clsx } from "clsx";
import { useTranslations } from "next-intl";
import { Chart as ReactChart } from "react-chartjs-2";
import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';
import 'dayjs/locale/zh-cn'
import { colorPalette, useSetDayJsLocale } from "./common";

Chart.register(Title)
Chart.register(Legend)
Chart.register(Tooltip)

Chart.register(CategoryScale)
Chart.register(LinearScale)
Chart.register(TimeScale)
Chart.register(ArcElement)
Chart.register(LineElement)
Chart.register(PointElement)

Chart.register(DoughnutController)


const outerRingMinRatio = 0.03
const innerRingMinRatio = 0.05

function aggregateTinyParts(counts: NestedCounts, otherLabel: string): NestedCounts {
  const newCounts: NestedCounts = {keyCounts: {}, subkeyCounts: {}}
  const valueSum = arraySum(Object.values(counts.keyCounts))
  const getRatio = (val: number) => val / valueSum

  {
    let otherCountSum = 0
    let otherCountNum = 0
    Object.entries(counts.keyCounts).forEach(([key, count]) => {
      if (getRatio(count) < outerRingMinRatio) {
        otherCountSum += count
        otherCountNum += 1
      } else {
        newCounts.keyCounts[key] = count
        newCounts.subkeyCounts[key] = {...(counts.subkeyCounts[key] || {})}
      }
    })
    if (otherCountNum <= 1) {
      // no need to aggregate
      newCounts.keyCounts = {...counts.keyCounts}
      newCounts.subkeyCounts = {...counts.subkeyCounts}
    } else {
      newCounts.keyCounts[otherLabel] = otherCountSum
      newCounts.subkeyCounts[otherLabel] = {otherLabel: otherCountSum}
    }
  }

  Object.entries(newCounts.subkeyCounts).forEach(([key, subCounts]) => {
    const newSubCounts: Counts = {}

    let subOtherCountSum = 0
    let subOtherCountNum = 0
    Object.entries(subCounts).forEach(([subkey, subCount]) => {
      if (getRatio(subCount) < innerRingMinRatio) {
        subOtherCountSum += subCount
        subOtherCountNum++
      } else {
        newSubCounts[subkey] = subCount
      }
    })

    if (subOtherCountNum > 1) {
      newSubCounts[otherLabel] = subOtherCountSum
      newCounts.subkeyCounts[key] = newSubCounts
    }
  })

  if (Object.keys(counts.subkeyCounts).length === 0) {
    newCounts.subkeyCounts = {}
  }
  return newCounts
}

export interface Counts { [label: string]: number }  // dict of (label -> count)

export interface NestedCounts {
  keyCounts: Counts
  subkeyCounts: {[label: string]: Counts}
}

export interface PieChartProps {
  className?: string
  title: string
  counts: NestedCounts
}

interface DataPoint {
  value: number
  label: string
  color: string
}

export function PieChart(props: PieChartProps) {
  useSetDayJsLocale()
  const t = useTranslations('page.stats.pie')

  const otherLabel: string = '###OTHER###'

  const counts = aggregateTinyParts( props.counts, otherLabel)
  const valueSum = arraySum(Object.values(counts.keyCounts))  // FIXME: handle if it's 0

  const mainDataPoints: DataPoint[] = []
  const subkeyDataPoints: DataPoint[] = []
  {
    const colorMapping: {[label: string]: string} = {}
    Object.entries(counts.keyCounts).forEach(([key, value], index) => {
      const color = colorPalette[index % colorPalette.length]
      mainDataPoints.push({ value, label: key, color })
      colorMapping[key] = color
    })
    Object.entries(counts.keyCounts).forEach(([key, value], _) => {
      const entries = Object.entries(counts.subkeyCounts[key] || {})
      const midColor = colorMapping[key]
      const colors: string[] = []
      const offsetRange = 90 * value / valueSum
      entries.forEach((_, index) => {
        const k = (index - Math.floor(entries.length / 2)) / entries.length
        const sign = k >= 0 ? '+' : ''
        const color = chroma(midColor).set('hsl.h', `${sign}${offsetRange * k}`).hex()
        colors.push(color)
      })
      entries.forEach(([subkey, subValue], index) => {
        subkeyDataPoints.push({ value: subValue, label: subkey, color: colors[index]})
      })
    })

  }
  const datasets: ChartDataset[] = [{
    label: t('label'),
    data: mainDataPoints.map(dp => dp.value),
    hoverOffset: 4,
    backgroundColor: mainDataPoints.map(dp => dp.color),
  }]

  const largeSubkeyIndexes: Set<number> = new Set()
  if (subkeyDataPoints.length >= 1) {
    datasets.push({
      label: t('label'),
      data: subkeyDataPoints.map(dp => dp.value),
      hoverOffset: 5,
      backgroundColor: subkeyDataPoints.map(dp => dp.color),
    })
    subkeyDataPoints.forEach((dp, index) => {
      if (dp.value / valueSum >= innerRingMinRatio) {
        largeSubkeyIndexes.add(index)
      }
    })
  }

  type SimpleContext = {datasetIndex: number, dataIndex: number}
  function shouldDisplayDetails(ctx: SimpleContext): boolean {
    return ctx.datasetIndex === 0 || (largeSubkeyIndexes.has(ctx.dataIndex) && getLabelRaw(ctx) !== otherLabel)
  }
  function getLabelRaw(ctx: SimpleContext): string {
    if (ctx.datasetIndex === 0) {
      return mainDataPoints[ctx.dataIndex].label
    } else {
      return subkeyDataPoints[ctx.dataIndex].label
    }
  }
  function getLabel(ctx: SimpleContext): string {
    const rawLabel = getLabelRaw(ctx)
    return rawLabel !== otherLabel ? rawLabel : t('other')
  }

  return <>
    {/* Add a wrapper container to restrict the chart's size*/}
    <div className={clsx(props.className, 'max-h-[80vh] max-w-[100vw]')}>
      <ReactChart
        type="doughnut"
        plugins={[ChartDataLabels]}
        options={{
          responsive: true,
          aspectRatio: 1.1,
          layout: {
            padding: {
              left: 15,
              right: 15,
              top: 10,
              bottom: 20,
            },
          },
          interaction: {
            mode: 'nearest',
          },
          animation: {
            duration: 0,
          },
          plugins: {
            tooltip: {
              enabled: true,
              callbacks: {
                title: (ctx) => getLabel(ctx[0])
              }
            },
            title: {
              display: true,
              padding: {
                top: 0,
                bottom: 36,
              },
              text: props.title,
              font: {
                size: 16,
              },
            },
            legend: {
              display: false,
            },
            datalabels: {
              display: true,
              labels: {
                index: {
                  display: shouldDisplayDetails,
                  align: (ctx) => ctx.datasetIndex === 0 ? 'end' : 'start',
                  anchor: (ctx) => ctx.datasetIndex === 0 ? 'end' : 'start',
                  formatter: (val, ctx) => getLabel(ctx as any),
                },
                value: {
                  display: shouldDisplayDetails,
                  color: '#404040',
                  backgroundColor: '#ffffffcc',
                  borderColor: '#ffffff00',
                  borderWidth: 2,
                  borderRadius: 4,
                  padding: 0,
                  align: 'center',
                  formatter: (val, ctx) => `${Math.round(100 * val / valueSum)}%`,
                },
              },
              color: '#000',
            },
          },
        }}
        data={{
          labels: Object.keys(counts.keyCounts),
          datasets: datasets,
        }}
      />
    </div>
  </>
}
