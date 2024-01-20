'use client'

import { SimpleEverything, SimplePlugin } from "@/catalogue/simple-types";
import { Pagination } from "@mantine/core";
import React, { useContext, useEffect, useState } from 'react';
import { DisplayStrategyContextValue, filterPlugins } from "./display-strategy";
import { DisplayStrategyContext } from "./display-strategy-provider";
import { PluginCard } from "./plugin-card";

function dateToTimestamp(date?: Date) {
  return date?.getTime() ?? 0
}

export function PluginList({everything}: {everything: SimpleEverything}) {
  const {ds} = useContext<DisplayStrategyContextValue>(DisplayStrategyContext)
  const [currentPage, setPage] = useState(1)

  const plugins: SimplePlugin[] = filterPlugins(Object.values(everything.plugins), ds)
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
    <div className="max-lg:mx-[8px] md:mx-3 mb-5 flex flex-col gap-4 items-center">
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
