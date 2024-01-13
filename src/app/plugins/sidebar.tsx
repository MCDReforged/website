import MyCard from "@/components/ui/my-card";
import { PluginLabel } from "@/components/ui/plugin-label";
import { pluginLabels } from "@/config/catalogue";
import { getEverything } from "@/data/utils";
import { Checkbox, Radio, RadioGroup, Stack, TextInput } from "@mantine/core";
import { IconFilter } from "@tabler/icons-react";

export function Sidebar() {
  const titleClassTop = 'text-lg font-bold mb-1.5'
  const titleClassMiddle = titleClassTop + '  mt-3'
  const everything = getEverything()

  return (
    <div>
      <MyCard className="p-5 overflow-hidden">
        <div className="flex flex-col">
          <p className={titleClassTop}>Plugin filter</p>
          <TextInput
            size="sm"
            leftSection={<IconFilter stroke={1.5}/>}
          />

          <p className={titleClassMiddle}>Label filter</p>
          <Stack gap={6}>
            {pluginLabels.map(label => (
              <
                Checkbox
                key={label} value={label}
                radius="sm"
                classNames={{body: "items-center", label: "flex items-center"}}
                label={<PluginLabel label={label}/>}
              />
            ))}
          </Stack>

          <p className={titleClassMiddle}>Sort order</p>

          <RadioGroup defaultValue="name">
            <Stack gap={6}>
              <Radio value="name" label="Plugin Name" />
              <Radio value="updates" label="Last Update" />
              <Radio value="downloads" label="Downloads" />
              <Checkbox radius="sm" label="Reversed"/>
            </Stack>
          </RadioGroup>
        </div>
      </MyCard>

      <MyCard className="p-5 my-5">
        <div className="flex flex-col">
          <p>Plugin amount: {everything && Object.keys(everything['plugins']).length || 'N/A'}</p>
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
