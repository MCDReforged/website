'use client'

import { AllOfAPlugin } from "@/catalogue/meta-types";
import { translateLangDict } from "@/utils/i18n-utils";
import { Skeleton } from "@mantine/core";
import { useLocale } from "next-intl";
import dynamic from "next/dynamic";
import React from "react";
import { TabBody } from "./plugin-content-common";

// import the css here to ensure the GitHub markdown css is loaded
// workaround for https://github.com/vercel/next.js/issues/17464
import "@/styles/github-markdown.css"

const DynamicMarkdown = dynamic(
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

export function PluginContentIntroduction({plugin}: { plugin: AllOfAPlugin }) {
  return (
    <TabBody>
      <DynamicMarkdown>
        {translateLangDict(useLocale(), plugin.plugin.introduction, true) || ''}
      </DynamicMarkdown>
    </TabBody>
  )
}
