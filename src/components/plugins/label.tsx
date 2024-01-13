import React from "react";
import { Badge, rem } from "@mantine/core";
import { IconInfoCircle, IconPlugConnected, IconTools, IconUser } from "@tabler/icons-react";

const iconStyle = { width: rem(15), height: rem(15) };
const labelConfigs: {[key: string]: any} = {
  'information': {
    color: 'cyan',
    icon: <IconInfoCircle style={iconStyle} />,
  },
  'tool': {
    color: 'blue',
    icon: <IconTools style={iconStyle} />,
  },
  'management': {
    color: 'red',
    icon: <IconUser style={iconStyle} />,
  },
  'api': {
    color: 'yellow.6',
    icon: <IconPlugConnected style={iconStyle} />,
  },
  '__default': {
    color: 'default',
    icon: <div>?</div>,
  },
}

export function PluginLabel({label}: {label: string}) {
  const cfg = labelConfigs[label] ?? labelConfigs['__default']
  return <Badge
    classNames={{root: "px-2"}}
    color={cfg.color}
    radius="md"
    size="md"
    leftSection={cfg.icon}
  >
    {label}
  </Badge >
}
