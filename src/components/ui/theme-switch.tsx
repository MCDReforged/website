import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

export function ThemeSwitch({...props}) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const icon = colorScheme === 'light' ? <IconSun stroke={1.5} /> : <IconMoon stroke={1.5} />
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