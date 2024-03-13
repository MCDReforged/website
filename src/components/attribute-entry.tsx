import React from "react";

interface AttributeEntryProps {
  className?: string
  Icon: React.ElementType
  label: string
  children: React.ReactNode
}

export function AttributeEntry({className, Icon, label, children}: AttributeEntryProps) {
  return (
    <div className={className}>
      <p className="font-bold mb-0.5 min-w-[80px] text-color-attribute-entry">{label}</p>
      <div className="flex gap-1.5 items-start">
        <div className="w-[22px] h-[22px] mt-[2px]">
          <Icon stroke={1.5} size={22}/>
        </div>
        {children}
      </div>
    </div>
  )
}
