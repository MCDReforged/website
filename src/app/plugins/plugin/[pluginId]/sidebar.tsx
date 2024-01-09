import { Card, Checkbox, CheckboxGroup, Input } from "@nextui-org/react";
import { FaFilter } from "react-icons/fa";
import { pluginLabels } from "@/config/catalogue";
import { PluginLabel } from "@/components/plugins/label";
import { AllOfAPlugin } from "@/types/plugin-catalogue-meta";

export function Sidebar({plugin}: {plugin: AllOfAPlugin}) {
  const titleClassTop = 'text-xl font-semibold mb-3'
  const titleClassMiddle = "text-xl font-semibold my-3"
  return (
    <div>
      <Card className="p-5 overflow-hidden" shadow="sm" radius="md">
        <div className="flex flex-col">
          <p className={titleClassTop}>Plugin filter</p>
          <Input
            variant="bordered"
            size="sm"
            startContent={<FaFilter/>}
          />

          <p className={titleClassMiddle}>Label filter</p>
          <CheckboxGroup defaultValue={[]}>
            {pluginLabels.map(label => (
              <Checkbox key={label} value={label}>
                <PluginLabel label={label}/>
              </Checkbox>
            ))}
          </CheckboxGroup>
        </div>
      </Card>

      <Card className="p-5 my-5" shadow="sm" radius="md">
        <div className="flex flex-col">
          <p>Plugin amount: 100</p>
        </div>
      </Card>
    </div>
  )
}
