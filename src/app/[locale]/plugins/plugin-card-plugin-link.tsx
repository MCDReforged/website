'use client'

import { Link } from "@/i18n-utils";
import { AllOfAPlugin } from "@/types/plugin-catalogue-meta";
import React from "react";

export function PluginCardPluginLink({plugin}: {plugin: AllOfAPlugin}) {
  return (
    <Link href={`/plugins/p/${plugin.plugin.id}`} className="text-2xl font-bold text-foreground hover:text-primary ml-1 mr-5">
      {plugin.meta.name}
    </Link>
  )
}