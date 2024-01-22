import { Badge } from "@mantine/core";
import { IconInfoCircle, IconPlugConnected, IconQuestionMark, IconTools, IconUser } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import React from "react";

interface LabelConfig {
  id: string
  color: string
  icon: typeof IconUser
}
interface LabelConfigMapping {
  [id: string]: LabelConfig
}

const labelConfigs: LabelConfig[] = [
  {
    id: 'information',
    color: 'cyan',
    icon: IconInfoCircle,
  },
  {
    id: 'tool',
    color: 'blue',
    icon: IconTools,
  },
  {
    id: 'management',
    color: 'red',
    icon: IconUser,
  },
  {
    id: 'api',
    color: 'yellow.7',
    icon: IconPlugConnected,
  }
]

const unknownConfig: LabelConfig = {
  id: '__unknown',
  color: 'default',
  icon: IconQuestionMark,
}

const labelConfigMapping: LabelConfigMapping = labelConfigs.reduce((obj: LabelConfigMapping, item) => {
  obj[item.id] = item
  return obj
}, {})

export function PluginLabel({label}: {label: string}) {
  const t = useTranslations('component.plugin_label')

  const cfg = labelConfigMapping[label] ?? unknownConfig
  return <Badge
    classNames={{root: "px-2 border-1 border-solid font-medium text-sm"}}
    variant="light-bordered"
    color={cfg.color}
    radius="md"
    size="22"
    leftSection={<cfg.icon size={16}/>}
  >
    {t(cfg.id)}
  </Badge >
}
