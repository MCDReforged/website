'use client'

import { Everything } from "@/catalogue/types";
import MyCard from "@/components/ui/my-card";
import { PluginLabel } from "@/components/ui/plugin-label";
import { pluginLabels } from "@/config/catalogue";
import { Checkbox, Radio, RadioGroup, Stack, TextInput } from "@mantine/core";
import { IconFilter } from "@tabler/icons-react";
import { clsx } from "clsx";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect } from "react";
import { DisplayStrategyContextValue, sortOrders } from "./display-strategy";
import { DisplayStrategyContext } from "./display-strategy-provider";

function ControlCard() {
  const titleClassTop = 'text-lg font-bold mb-1.5'
  const titleClassMiddle = clsx(titleClassTop, 'mt-3')
  const {ds, setDs} = useContext<DisplayStrategyContextValue>(DisplayStrategyContext)

  const params = useSearchParams()
  useEffect(() => {
    // TODO: Read params
  }, [params])

  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (ds.keyword) {
      queryParams.append('keyword', ds.keyword);
    }
    if (ds.sortOrder) {
      queryParams.append('sort', ds.sortOrder);
    }
    // TODO: set params
  }, [ds])

  const onFilterTextChanged = (text: string) => {
    ds.keyword = text
    setDs({...ds})
  }
  const onLabelFilterCheckboxChanged = (what: string, checked: boolean) => {
    if (checked) {
      ds.selectedLabels.push(what)
    } else {
      ds.selectedLabels = ds.selectedLabels.filter(l => l !== what)
    }
    setDs({...ds})
  }
  const onSortOrderRatioSet = (what: string) => {
    ds.sortOrder = what
    setDs({...ds})
  }
  const onSortReversedCheckboxSet = (checked: boolean) => {
    ds.sortReversed = checked
    setDs({...ds})
  }

  const t = useTranslations('Plugins');

  return (
    <MyCard className="p-5 overflow-hidden">
      <div className="flex flex-col">
        <p className={titleClassTop}>Plugin filter</p>
        <TextInput
          size="sm"
          leftSection={<IconFilter stroke={1.5}/>}
          onChange={(event) => onFilterTextChanged(event.currentTarget.value)}
        />

        <p className={titleClassMiddle}>Label filter</p>
        <Stack gap={6}>
          {pluginLabels.map(label => (
            <
              Checkbox
              key={label} value={label}  // TODO: translate
              radius="sm"
              classNames={{body: "items-center", label: "flex items-center"}}
              label={<PluginLabel label={label}/>}
              onChange={event => onLabelFilterCheckboxChanged(label, event.currentTarget.checked)}
            />
          ))}
        </Stack>

        <p className={titleClassMiddle}>Sort order</p>

        <RadioGroup defaultValue="name" onChange={onSortOrderRatioSet}>
          <Stack gap={6}>
            {sortOrders.map(so => (
              <Radio key={so} value={so} label={<p>{t(`sort_order.${so}`)}</p>}/>
            ))}
            <Checkbox radius="sm" label="Reversed" onChange={event => onSortReversedCheckboxSet(event.currentTarget.checked)}/>
          </Stack>
        </RadioGroup>
      </div>
    </MyCard>
  )
}

function StatsCard({everything}: {everything: Everything}) {
  return (
    <MyCard className="p-5">
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
  )
}

export function Sidebar({everything}: {everything: Everything}) {
  return (
    <div className="flex flex-col gap-5">
      <ControlCard />
      <StatsCard everything={everything} />
    </div>
  )
}
