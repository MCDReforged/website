import React from "react";
import { Badge, Chip } from "@mantine/core";
import { IconInfoCircle, IconLinkOff, IconQuestionMark, IconTools, IconUser } from "@tabler/icons-react";

const labelConfigs: {[key: string]: any} = {
  'information': {
    color: 'primary',
    icon: <IconInfoCircle />,
  },
  'tool': {
    color: 'secondary',
    icon: <IconTools />,
  },
  'management': {
    color: 'danger',
    icon: <IconUser />,
  },
  'api': {
    color: 'warning',
    icon: <IconLinkOff />,
  },
  '__default': {
    color: 'default',
    icon: <IconQuestionMark />,
  },
}

export function PluginLabel({label}: {label: string}) {
  const cfg = labelConfigs[label] ?? labelConfigs['__default']
  return <Badge
    className="mx-1"
    color={cfg.color}
    radius="sm"
    variant="outline"
    leftSection={<div className="ml-1">{cfg.icon}</div>}
  >
    {label}
  </Badge >
}
