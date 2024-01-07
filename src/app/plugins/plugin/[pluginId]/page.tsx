export async function generateStaticParams() {
  return [
    { pluginId: 'plugin_a' },
    { pluginId: 'my_plugin' },
  ]
}

export default function Page({ params }: { params: { pluginId: string } }) {
  return <h1>Plugin page for {params.pluginId}</h1>
}