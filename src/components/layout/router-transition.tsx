'use client';

import { NavigationCompleteHook } from "@/common/nprogress/hook";
import { NavigationProgress } from '@mantine/nprogress';
import '@mantine/nprogress/styles.css';

export function RouterTransition() {
  return (
    <>
      <NavigationProgress/>
      <NavigationCompleteHook/>
    </>
  )
}