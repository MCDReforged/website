"use client"
import { pluginLabels } from "@/config/catalogue";
import { PluginLabel } from "@/components/plugins/label";
import MyCard from "@/components/ui/my-card";
import { IconFilter } from "@tabler/icons-react";
import { Checkbox, Radio, Stack, TextInput } from "@mantine/core";

export function Sidebar() {
  const titleClassTop = 'text-lg font-bold mb-1.5'
  const titleClassMiddle = titleClassTop + '  mt-3'
  return (
    <div>
      <MyCard className="p-5 overflow-hidden">
        <div className="flex flex-col">
          <p className={titleClassTop}>Plugin filter</p>
          <TextInput
            label="Filter plugin"
            size="sm"
            leftSection={<IconFilter/>}
          />

          <p className={titleClassMiddle}>Label filter</p>
          <Stack>
            {pluginLabels.map(label => (
              <Checkbox key={label} value={label} radius="sm" label={<PluginLabel label={label}/>} />
            ))}
          </Stack>

          <p className={titleClassMiddle}>Sort order</p>

          <Radio.Group defaultValue="name">
            <Radio value="name" label="Plugin Name" />
            <Radio value="updates" label="Last Update" />
            <Radio value="downloads" label="Downloads" />
            <Checkbox radius="sm">Reversed</Checkbox>
          </Radio.Group>
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
