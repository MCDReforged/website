import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { clsx } from "clsx";
import styles from "./theme-switch.module.css"

export function ThemeSwitch({...props}) {
  const { toggleColorScheme } = useMantineColorScheme()

  return (
    <ActionIcon
      aria-label="Theme switch"
      variant="default"
      size="lg"
      onClick={toggleColorScheme}
      {...props}
    >
      <IconSun stroke={1.5} className={clsx(styles.sun, "text-mantine-text")}/>
      <IconMoon stroke={1.5} className={clsx(styles.moon, "text-mantine-text")}/>
    </ActionIcon>
  )
}
