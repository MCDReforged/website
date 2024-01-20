export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto max-w-6xl px-2 py-6">
      {children}
    </div>
  )
}
