import { Checkbox, CheckboxGroup, Input, Radio, RadioGroup } from "@nextui-org/react";
import { FaFilter } from "react-icons/fa";
import { pluginLabels } from "@/config/catalogue";
import { PluginLabel } from "@/components/plugins/label";
import MyCard from "@/components/ui/my-card";

export function Sidebar() {
  const titleClassTop = 'text-lg font-bold mb-1.5'
  const titleClassMiddle = titleClassTop + '  mt-3'
  return (
    <div>
      <MyCard className="p-5 overflow-hidden">
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
              <Checkbox key={label} value={label} radius="sm">
                <PluginLabel label={label}/>
              </Checkbox>
            ))}
          </CheckboxGroup>

          <p className={titleClassMiddle}>Sort order</p>

          <RadioGroup defaultValue="name">
            <Radio value="name">Plugin Name</Radio>
            <Radio value="updates">Last Update</Radio>
            <Radio value="downloads">Downloads</Radio>
            <Checkbox radius="sm">Reversed</Checkbox>
          </RadioGroup>
        </div>
      </MyCard>

      <MyCard className="p-5 my-5">
        <div className="flex flex-col">
          <p>Plugin amount: 100</p>
          <p className="font-extrabold">Font字体 font-extrabold</p>
          <p className="font-bold">Font字体 font-bold</p>
          <p className="font-semibold">Font字体 font-semibold</p>
          <p className="font-medium">Font字体 font-medium</p>
          <p className="font-normal">Font字体 font-normal</p>
          <p className="font-light">Font字体 font-light</p>
          <p className="font-extralight">Font字体 font-extralight</p>
        </div>
      </MyCard>
    </div>
  )
}
