'use client'

import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export function ThemeSwitch({...props}) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

  // https://nextjs.org/docs/messages/react-hydration-error#solution-1-using-useeffect-to-run-on-the-client-only
  const [isServer, setIsServer] = useState(true)
  useEffect(() => {
    setIsServer(false)
  }, [])

  const icon = isServer || colorScheme === 'light' ? <IconSun stroke={1.5} /> : <IconMoon stroke={1.5} />
  return (
    <ActionIcon
      aria-label="Theme switch"
      variant="default"
      size="lg"
      onClick={toggleColorScheme}
      {...props}
    >
      {icon}
    </ActionIcon>
  )
}