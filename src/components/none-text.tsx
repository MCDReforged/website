import React from "react";

export function NoneText({className, children}: { className?: string, children: string }) {
  return (
    <p className={className}>
      <i className="text-mantine-dimmed select-none">
        {children}
      </i>
    </p>
  )
}
