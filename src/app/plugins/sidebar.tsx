import { Card, Checkbox, CheckboxGroup, Input } from "@nextui-org/react";
import { FaFilter } from "react-icons/fa";
import { MyDropdown } from "./dropdown-fix";
import { pluginLabels } from "@/config/catalogue";
import { PluginLabel } from "@/components/plugins/label";

export function Sidebar() {
  const titleClassTop = 'text-xl font-bold mb-3'
  const titleClassMiddle = "text-xl font-bold my-3"
  return (
    <div>
      <Card className="p-5 my-5 overflow-hidden" shadow="sm" radius="md">
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

          <p className={titleClassMiddle}>Sort order</p>
          <MyDropdown/>
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
