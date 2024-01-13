import { getEverything } from "@/data/utils";
import React from 'react';
import { PluginCard } from "./plugin-card";

const everything = getEverything()

export function PluginList() {
  return (
    <div className="mx-5 mb-5">
      <p className="text-2xl font-bold text-center mb-3">Plugin List</p>
      <div className="gap-4 grid grid-cols-1">
        {Object.values(everything.plugins).map(plugin => {
          return <PluginCard key={plugin.meta.id} plugin={plugin}/>
        })}
      </div>
    </div>
  )
}
