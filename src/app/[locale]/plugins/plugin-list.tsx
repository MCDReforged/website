'use client'

import { SimpleEverything, SimplePlugin } from "@/catalogue/simple-types";
import { Pagination } from "@mantine/core";
import React, { useContext, useEffect, useState } from 'react';
import { DisplayStrategyContextValue } from "./display-strategy";
import { DisplayStrategyContext } from "./display-strategy-provider";
import { PluginCard } from "./plugin-card";

function dateToTimestamp(date?: Date) {
  return date?.getTime() ?? 0
}

export function PluginList({everything}: {everything: SimpleEverything}) {
  const {ds} = useContext<DisplayStrategyContextValue>(DisplayStrategyContext)
  const [currentPage, setPage] = useState(1)

  const plugins: SimplePlugin[] = Object.values(everything.plugins)
    .filter(plugin => {
      if (ds.keyword !== '') {
        if (!plugin.id.includes(ds.keyword) && !plugin.name.includes(ds.keyword)) {
          return false
        }
      }
      if (ds.selectedLabels.length > 0) {
        const set = new Set(ds.selectedLabels);
        if (!plugin.labels.some(item => set.has(item))) {
          return false
        }
      }
      return true
    })
    .sort((a: SimplePlugin, b: SimplePlugin) => {
      let ret: number
      if (ds.sortOrder === 'downloads') {
        ret = b.downloads - a.downloads;
      } else if (ds.sortOrder === 'recentUpdate') {
        ret = dateToTimestamp(b.recentUpdated) - dateToTimestamp(a.recentUpdated)
      } else {
        ret = a.name.localeCompare(b.name);
      }
      if (ds.sortReversed) {
        ret = -ret
      }
      return ret
    })

  const pluginsPerPage = 15
  const totalPages = Math.ceil(plugins.length / pluginsPerPage)
  const effectivePage = Number.isNaN(currentPage) ? 1 : currentPage
  const paginatedPlugins: SimplePlugin[] = plugins.slice((effectivePage - 1) * pluginsPerPage, effectivePage * pluginsPerPage)

  useEffect(() => {
    let clampedPage = Math.max(1, Math.min(currentPage, totalPages))
    if (clampedPage !== currentPage) {
      setPage(clampedPage)
    }
  }, [currentPage, totalPages])

  function Pager() {
    return <Pagination
      total={totalPages}
      value={currentPage}
      onChange={setPage}
      getControlProps={(control) => {
        return {
          'aria-label': `${control} page`,
        }
      }}
    />
  }

  return (
    <div className="lg:mx-5 mb-5 flex flex-col gap-6 items-center">
      <Pager/>
      <div className="gap-4 flex flex-col w-full">
        {paginatedPlugins.map(plugin => {
          return <PluginCard key={plugin.id} plugin={plugin} authors={everything.authors}/>
        })}
      </div>
      <Pager/>
    </div>
  )
}
