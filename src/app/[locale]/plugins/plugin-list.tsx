'use server'

import { Everything } from "@/types/plugin-catalogue-meta";
import React from 'react';
import { DisplayStrategy } from "./display-strategy";
import { PluginCard } from "./plugin-card";

export async function PluginList({everything, ds}: {everything: Everything, ds: DisplayStrategy}) {
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
