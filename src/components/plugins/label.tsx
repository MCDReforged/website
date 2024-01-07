import { FaInfoCircle, FaLink, FaQuestion, FaToolbox, FaUserCog } from "react-icons/fa";
import { Chip } from "@nextui-org/react";
import React from "react";

export function PluginLabel({label}: {label: string}) {
  let startContent = {
    'information': <FaInfoCircle />,
    'tool': <FaToolbox />,
    'management': <FaUserCog />,
    'api': <FaLink />,
  }[label] ?? <FaQuestion />
  return <Chip
    className="mx-1"
    color="primary"
    radius="sm"
    startContent={<div className="ml-1">{startContent}</div>}
  >
    {label}
  </Chip>
}
