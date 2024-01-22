'use client'

import { Skeleton } from "@mantine/core";
import dynamic from "next/dynamic";
import React from "react";

// import the css here to ensure the GitHub markdown css is loaded
// workaround for https://github.com/vercel/next.js/issues/17464
import "@/styles/github-markdown.css"

const DynamicGfmMarkdownLarge = dynamic(
  () => import('@/components/gfm-markdown'),
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

const TinyMarkdownChildrenContext = React.createContext('')

function TinyMarkdownLiteralFallback() {
  const content = React.useContext(TinyMarkdownChildrenContext)
  return <p>{content}</p>
}

const DynamicGfmMarkdownTiny = dynamic(
  () => import('@/components/gfm-markdown'),
  {
    loading: TinyMarkdownLiteralFallback,
  }
)

interface DynamicGfmMarkdownProps {
  dgmVariant?: 'large' | 'tiny' | undefined
  children: string
  [_: string]: any
}

export function DynamicGfmMarkdown({dgmVariant, children, ...markdownProps}: DynamicGfmMarkdownProps) {
  if (dgmVariant === 'tiny') {
    return (
      <TinyMarkdownChildrenContext.Provider value={children}>
        <DynamicGfmMarkdownTiny {...markdownProps}>
          {children}
        </DynamicGfmMarkdownTiny>
      </TinyMarkdownChildrenContext.Provider>
    )
  } else {
    return (
      <DynamicGfmMarkdownLarge {...markdownProps}>
        {children}
      </DynamicGfmMarkdownLarge>
    )
  }
}
