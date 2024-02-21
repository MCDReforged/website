'use client'

import dynamic from "next/dynamic";

// warp the hook to fix duplicated double ccs file loading (one from layout, one from page)
export const HighlightJsHookDynamic = dynamic(
  () => import('./highlight-js-hook').then(mod => mod.HighlightJsHook)
)
