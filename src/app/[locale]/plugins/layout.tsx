import { CommonContentLayout } from "@/components/layout/common-content-layout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CommonContentLayout>
      {children}
    </CommonContentLayout>
  )
}
