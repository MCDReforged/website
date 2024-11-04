import { Badge, FloatingPosition } from "@mantine/core";
import { Icon, IconAffiliate, IconInfoCircle, IconPlugConnected, IconQuestionMark, IconTools, IconUserCog } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import React from "react";
import { ClickableTooltip } from "../clickable-tooltip";

interface LabelConfig {
  id: string
  color: string
  icon: Icon
}
interface LabelConfigMapping {
  [id: string]: LabelConfig
}

const labelConfigs: LabelConfig[] = [
  {
    id: 'information',
    color: 'green.7',
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
    icon: IconUserCog,
  },
  {
    id: 'api',
    color: 'yellow.7',
    icon: IconPlugConnected,
  },
  {
    id: 'handler',
    color: 'violet.5',
    icon: IconAffiliate,
  },
]

const unknownConfig: LabelConfig = {
  id: '__unknown',
  color: 'dark.4',
  icon: IconQuestionMark,
}

const labelConfigMapping: LabelConfigMapping = labelConfigs.reduce((obj: LabelConfigMapping, item) => {
  obj[item.id] = item
  return obj
}, {})

interface PluginLabelProps {
  label: string
  descPos?: FloatingPosition
}

export function PluginLabel({label, descPos}: PluginLabelProps) {
  const tName = useTranslations('component.plugin_label.name')
  const tDesc = useTranslations('component.plugin_label.description')

  const cfg = labelConfigMapping[label] ?? unknownConfig
  let badge = (
    <Badge
      classNames={{root: "px-2 border-1 border-solid font-medium text-[12px]"}}
      variant="light-bordered"
      color={cfg.color}
      radius="md"
      size="22"
      leftSection={<cfg.icon size={16}/>}
    >
      {cfg === unknownConfig ? `(${tName(cfg.id)}) ${label}` : tName(cfg.id)}
    </Badge >
  )

  if (cfg !== unknownConfig) {
    badge = (
      <ClickableTooltip label={tDesc(cfg.id)} position={descPos} openDelay={500}>
        {badge}
      </ClickableTooltip>
    )
  }
  return badge
}
