'use client'

import { ActionIcon, MantineColorScheme, Menu, useMantineColorScheme } from "@mantine/core";
import { Icon, IconDeviceDesktop, IconMoon, IconSunHigh, IconSunMoon } from "@tabler/icons-react";
import { clsx } from "clsx";
import { useContext } from "react";
import { NavbarSwitchStateContext, NavbarSwitchStateContextValue } from "./navbar-switch-state";
import styles from "./theme-switch.module.css"

const config: {[colorTheme in MantineColorScheme]: Icon} = {
  'light': IconSunHigh,
  'auto': IconDeviceDesktop,
  'dark': IconMoon,
}

function ThemeIcon({colorTheme, className}: {colorTheme: MantineColorScheme, className?: string}) {
  const Icon = config[colorTheme]
  const stroke = Icon === IconSunMoon || Icon === IconDeviceDesktop ? 1.4 : 1.5;
  return <Icon stroke={stroke} className={clsx("text-mantine-text", className)}/>
}

export function ThemeSwitch() {
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const ctx = useContext<NavbarSwitchStateContextValue>(NavbarSwitchStateContext)

  return (
    <Menu
      radius="md"
      trigger="click-hover"
      openDelay={100} closeDelay={400}
      opened={ctx.shouldOpen('theme')} onChange={o => ctx.setOpen('theme', o)}
    >
      <Menu.Target>
        <ActionIcon aria-label="Theme switch" variant="default" size="lg">
          <ThemeIcon colorTheme="light" className="dark:hidden"/>
          <ThemeIcon colorTheme="dark" className="hidden dark:block"/>
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <div className="flex gap-1">
          {Object.keys(config).map(key => {
            const ct = key as MantineColorScheme
            return (
              <ActionIcon
                key={key}
                className={styles.selected}
                variant="transparent"
                size="lg"
                data-active={ct === colorScheme}
                onClick={() => setColorScheme(ct)}
              >
                <ThemeIcon colorTheme={ct}/>
              </ActionIcon>
            )
          })}
        </div>
      </Menu.Dropdown>
    </Menu>
  )
}
