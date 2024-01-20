'use client'

import { Skeleton } from "@mantine/core";
import dynamic from "next/dynamic";
import React from "react";

// import the css here to ensure the GitHub markdown css is loaded
// workaround for https://github.com/vercel/next.js/issues/17464
import "@/styles/github-markdown.css"

const DynamicGfmMarkdownImpl = dynamic(
  () => import('@/components/ui/gfm-markdown'),
  {
    loading: () => (
      <div className="flex flex-col gap-3 pt-2">
        <Skeleton height="0.8rem"/>
        <Skeleton height="0.8rem" width="50%"/>
        <Skeleton height="0.8rem" width="70%"/>
      </div>
    ),
  }
)

export function DynamicGfmMarkdown({children, ...markdownProps}: {children: string, [_: string]: any}) {
  return (
    <DynamicGfmMarkdownImpl {...markdownProps}>
      {children}
    </DynamicGfmMarkdownImpl>
  )
}
