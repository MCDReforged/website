import React from "react";

export function CommonContentLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="container mx-auto max-w-[1200px] px-2 py-6">
      {children}
    </div>
  )
}
