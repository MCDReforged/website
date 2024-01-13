import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

export function ThemeSwitch({...props}) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  return (
    <ActionIcon
      aria-label="Toggle color scheme"
      variant="default"
      size="lg"
      onClick={toggleColorScheme}
      {...props}
    >
      {colorScheme === 'light' ? <IconSun stroke={1.5} /> : <IconMoon stroke={1.5} />}
    </ActionIcon>
  )
}