'use client'

import dynamic from "next/dynamic";

const DynamicAnalytics = dynamic(() => import('@vercel/analytics/react').then(mod => mod.Analytics))
const DynamicSpeedInsights = dynamic(() => import('@vercel/speed-insights/next').then(mod => mod.SpeedInsights))

export function VercelScripts() {
  // https://vercel.com/docs/analytics/quickstart
  // https://vercel.com/docs/speed-insights/quickstart
  return (
    <>
      <DynamicAnalytics />
      <DynamicSpeedInsights />
    </>
  )
}