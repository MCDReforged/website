import { FaInfoCircle, FaLink, FaQuestion, FaToolbox, FaUserCog } from "react-icons/fa";
import { Chip } from "@nextui-org/react";
import React from "react";

const labelConfigs: {[key: string]: any} = {
  'information': {
    color: 'primary',
    icon: <FaInfoCircle />,
  },
  'tool': {
    color: 'secondary',
    icon: <FaToolbox />,
  },
  'management': {
    color: 'danger',
    icon: <FaUserCog />,
  },
  'api': {
    color: 'warning',
    icon: <FaLink />,
  },
  '__default': {
    color: 'default',
    icon: <FaLink />,
  },
}

export function PluginLabel({label}: {label: string}) {
  const cfg = labelConfigs[label] ?? labelConfigs['__default']
  return <Chip
    className="mx-1"
    classNames={{
      base: `border-${cfg.color} text-${cfg.color}`,
    }}
    radius="sm"
    variant="bordered"
    startContent={<div className="ml-1">{cfg.icon}</div>}
  >
    {label}
  </Chip>
}
