import { Card } from "@nextui-org/react";

export default function MyCard({children, ...props}: {children: React.ReactNode, [key: string]: any}) {
  return (
    <Card shadow="sm" radius="md" {...props}>
      {children}
    </Card>
  )
}
