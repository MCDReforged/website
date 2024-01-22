'use client'

import dynamic from "next/dynamic";

export const TimeAgoDynamic = dynamic(
  () => import('@/components/time-ago').then(mod => mod.TimeAgo),
  {
    loading: () => <p>...</p>,
  }
)
