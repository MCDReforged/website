import { PluginList } from "./plugin-list";
import { Sidebar } from "./sidebar";

export default function Page() {
  return (
    <div>
      <div className="lg:fixed lg:w-[18rem]">
        <Sidebar/>
      </div>
      <div className="lg:pl-[19rem]">
        <PluginList/>
      </div>
    </div>
  )
}
