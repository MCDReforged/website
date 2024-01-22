import { Card } from "@mantine/core";

export default function CommonCard({children, ...props}: {children: React.ReactNode, [key: string]: any}) {
  return (
    <Card shadow="none" radius="md" withBorder {...props}>
      {children}
    </Card>
  )
}
