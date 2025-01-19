'use client'

import { arrayMax } from "@/utils/math-utils";
import { CategoryScale, Chart, ChartDataset, Decimation, Legend, LinearScale, LineController, LineElement, PointElement, TimeScale, Title, Tooltip } from "chart.js";
import chroma from "chroma-js";
import { clsx } from "clsx";
import { Chart as ReactChart } from "react-chartjs-2";
import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';
import 'dayjs/locale/zh-cn'
import { colorPalette, useSetDayJsLocale } from "./common";

Chart.register(Title)
Chart.register(Tooltip)
Chart.register(Legend)
Chart.register(Decimation)

Chart.register(CategoryScale)
Chart.register(LinearScale)
Chart.register(TimeScale)
Chart.register(LineElement)
Chart.register(PointElement)

Chart.register(LineController)

interface LineChartProps {
  className?: string
  title: string

  timestamps: number[]
  values: {[label: string]: number[]}
}

export function LineChart(props: LineChartProps) {
  useSetDayJsLocale()

  let values = {...props.values}
  if (Object.keys(values).length > 0) {
    const maxCounts = Object.values(values).map(counts => arrayMax(counts))
    const maxMaxCount = arrayMax(maxCounts)
    Object.keys(values).forEach((key, idx) => {
      if (maxCounts[idx] / maxMaxCount < 0.01) {
        delete values[key]
      }
    })
  }

  return (
    <ReactChart
      className={clsx(props.className)}
      type="line"
      plugins={[]}
      options={{
        responsive: true,
        interaction: {
          intersect: false,
          axis: 'x',
          mode: 'nearest',
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
              displayFormats: {
                'day': 'L',
              },
              tooltipFormat: 'LLLL',
            },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 10,
            }
          }
        },
        plugins: {
          tooltip: {
            enabled: true,
          },
          title: {
            display: true,
            text: props.title,
            font: {
              size: 16,
            },
          },
          legend: {
            display: true,
            position: 'right',
          },
          decimation: {
            enabled: true,
          },
        }
      }}
      data={{
        labels: props.timestamps.map(item => item * 1000),
        datasets: Object.entries(values).map(([label, counts], idx) => {
          return {
            label: label,
            data: counts,
            tension: 0.5,
            cubicInterpolationMode: 'monotone',
            pointStyle: false,
            backgroundColor: chroma(colorPalette[idx]).darken(0.3).hex(),
            borderColor: chroma(colorPalette[idx]).brighten(0.1).hex(),
          } as ChartDataset
        }),
      }}
    />
  )
}
