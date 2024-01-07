import { PluginList } from "./plugin-list";
import { Input } from "@nextui-org/react";
import { FaFilter } from "react-icons/fa";
import { MyDropdown } from "./dropdown-fix";
import {CheckboxGroup, Checkbox } from "@nextui-org/react";
import { pluginLabels } from "@/config/catalogue";
import { PluginLabel } from "@/components/plugins/label";

function Sidebar() {
  const titleClass = "text-xl font-bold my-2"
  return (
    <div>
      <p className={titleClass}>Plugin filter</p>
      <Input
        variant="bordered"
        startContent={<FaFilter/>}
      />

      <p className={titleClass}>Label filter</p>
      <CheckboxGroup
        defaultValue={[]}
      >
        {pluginLabels.map(label => (
          <Checkbox key={label} value={label}>
            <PluginLabel label={label}/>
          </Checkbox>
        ))}
      </CheckboxGroup>

      <p className={titleClass}>Sort order</p>
      <MyDropdown/>

      <p>line11111111111111111111 1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx11</p>
      <p>line1</p>
      <p>line1</p>
      <p>line1</p>
      <p>line1</p>
      <p>line1</p>
      <p>line1</p>
      <p>line1</p>
      <p>line1</p>
      <p>line1</p>
      <p>line1</p>
      <p>line1</p>
      <p>line1</p>
      <p>line1</p>
      <p>line1</p>
      <p>line1</p>
      <p>line1</p>
      <p>line1</p>
      <p>line1</p>
    </div>
  )
}

export default function Page() {
  return (
    <div>
      <p className="text-center text-4xl font-bold mb-5">MCDReforged Plugin Catalogue</p>

      <div className="lg:fixed lg:w-[18rem] border rounded overflow-hidden">
        <Sidebar/>
      </div>
      <div className="lg:pl-[19rem] border rounded">
        <PluginList/>
      </div>
    </div>
  )
}
