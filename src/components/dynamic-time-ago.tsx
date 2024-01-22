'use client'

import dynamic from "next/dynamic";

export const DynamicTimeAgo = dynamic(
  () => import('@/components/time-ago').then(mod => mod.TimeAgo),
  {
    loading: () => <p>...</p>,
  }
)
