import MyCard from "@/components/ui/my-card";
import { PluginLabel } from "@/components/ui/plugin-label";
import { AllOfAPlugin } from "@/types/plugin-catalogue-meta";

export function Sidebar({plugin}: {plugin: AllOfAPlugin}) {
  return (
    <div>
      <MyCard className="p-5 overflow-hidden" shadow="sm" radius="md">
        <div className="flex flex-col">
          <p className="text-2xl font-semibold mb-3">{plugin.meta.name}</p>
          <p className="mb-3">{plugin.meta.description['en_us']}</p>
          <div className="flex flex-wrap gap-y-1">
            {plugin.plugin.labels.map(label => (
              <div key={label} className="">
                <PluginLabel label={label}/>
              </div>
            ))}
          </div>
        </div>
      </MyCard>

      <MyCard className="p-5 my-5" shadow="sm" radius="md">
        <div className="flex flex-col">
          <p>Plugin amount: 100</p>
        </div>
      </MyCard>
    </div>
  )
}
