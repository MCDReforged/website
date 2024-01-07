import {PluginList} from "@/components/plugins/plugin-list";

function Sidebar() {
  return (
    <div>
      Sidebar
    </div>
  )
}

export default function Page() {
  return (
    <div>
      <h1>MCDReforged Plugin Catalogue</h1>
      <div className="flex flex-row gap-5">
        <div className="basis-1/4 border rounded">
          <Sidebar/>
        </div>
        <div className="basis-3/4 border rounded">
          <PluginList/>
        </div>
      </div>
    </div>
  )
}