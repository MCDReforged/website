import { Card } from "@nextui-org/react";

export default function MyCard({children, ...props}) {
  return (
    <Card shadow="sm" radius="md" {...props}>
      {children}
    </Card>
  )
}
