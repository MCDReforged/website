'use client'

import dynamic from "next/dynamic";
import React from "react";

// import the css here to ensure the GitHub markdown css is loaded
// workaround for https://github.com/vercel/next.js/issues/17464
import "@/styles/github-markdown.css"

export default function DynamicGfmMarkdown({children, fallback, ...props}: {children: string, fallback: React.ReactNode, [key: string]: any}) {
  const DynamicMarkdown = dynamic(
    () => import('@/components/ui/gfm-markdown'),
    {
      loading: () => <>{fallback}</>,
    }
  )
  return (
    <DynamicMarkdown {...props}>
      {children}
    </DynamicMarkdown>
  )
}
