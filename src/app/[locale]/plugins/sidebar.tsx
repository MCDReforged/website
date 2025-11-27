'use client'

import { SimpleEverything } from "@/catalogue/simple-types";
import { clsx } from "clsx";
import { useState } from "react";
import { ControlCard } from "./sidebar-control";
import { StatsCard } from "./sidebar-stats";

export function Sidebar({everything}: { everything: SimpleEverything }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="mx-[8px] flex flex-col gap-5">
      <ControlCard everything={everything} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <StatsCard everything={everything} className={clsx(isExpanded ? 'block' : 'hidden', 'md:block')}/>
    </div>
  )
}
