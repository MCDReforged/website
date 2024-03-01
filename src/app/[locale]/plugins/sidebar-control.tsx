'use client'

import { SimpleEverything } from "@/catalogue/simple-types";
import { PluginLabel } from "@/components/plugin/plugin-label";
import { pluginLabels } from "@/site/catalogue";
import { Checkbox, Radio, RadioGroup, Switch, TextInput } from "@mantine/core";
import { IconFilter, IconUser } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import React, { useContext } from "react";
import { DisplayStrategyContextValue, filterPlugins, sortOrderDefault, sortOrders } from "./display-strategy";
import { DisplayStrategyContext } from "./display-strategy-provider";
import { CardSection, SidebarCard } from "./sidebar-common";

function FilterTextInput({Icon, onChanged, label, placeholder, defaultValue}: {
  Icon: typeof IconFilter, onChanged: (_: string) => void, label: string, placeholder: string, defaultValue: string
}) {
  return (
    <TextInput
      size="sm"
      leftSection={<Icon size={20} stroke={1.5}/>}
      onChange={(event) => onChanged(event.currentTarget.value)}
      aria-label={label}
      label={label}
      placeholder={placeholder}
      defaultValue={defaultValue}
      classNames={{label: 'font-normal'}}
    />
  )
}

export function ControlCard({everything}: { everything: SimpleEverything }) {
  const t = useTranslations('page.plugin_list.sidebar')
  const {dsHolder: {value: ds}, setDsHolder} = useContext<DisplayStrategyContextValue>(DisplayStrategyContext)
  const allPlugins = Object.values(everything.plugins)
  const filteredPlugins = filterPlugins(allPlugins, ds)

  const updateDs = () => setDsHolder({value: ds})
  const onNameFilterTextChanged = (text: string) => {
    ds.nameKeyword = text
    updateDs()
  }
  const onAuthorFilterTextChanged = (text: string) => {
    ds.authorKeyword = text
    updateDs()
  }
  const onLabelFilterCheckboxChanged = (what: string, checked: boolean) => {
    if (checked) {
      ds.selectedLabels.push(what)
    } else {
      ds.selectedLabels = ds.selectedLabels.filter(l => l !== what)
    }
    updateDs()
  }
  const onSortOrderRatioSet = (what: string) => {
    ds.sortOrder = what
    updateDs()
  }
  const onSortReversedCheckboxSet = (checked: boolean) => {
    ds.sortReversed = checked
    updateDs()
  }

  return (
    <SidebarCard>
      <CardSection title={t('plugin_filter')} className="gap-0.5">
        <FilterTextInput Icon={IconFilter} onChanged={onNameFilterTextChanged} defaultValue={ds.nameKeyword} label={t('plugin_filter_name')} placeholder="qbm"/>
        <FilterTextInput Icon={IconUser} onChanged={onAuthorFilterTextChanged} defaultValue={ds.authorKeyword} label={t('plugin_filter_author')} placeholder="fallen"/>
      </CardSection>

      <CardSection title={t('label_filter')} className="gap-1">
        {pluginLabels.map(label => {
          const amount = filteredPlugins.filter(plugin => plugin.labels.includes(label)).length
          return (
            <div key={label} className="flex flex-row justify-between items-center">
              <
                Checkbox
                defaultChecked={ds.selectedLabels.includes(label)}
                value={label}
                radius="sm"
                label={<PluginLabel label={label}/>}
                onChange={event => onLabelFilterCheckboxChanged(label, event.currentTarget.checked)}
              />
              <p>{amount}x</p>
            </div>
          )
        })}
      </CardSection>

      <CardSection title={t('sort_order')} className="gap-1.5">
        <RadioGroup defaultValue={ds.sortOrder ?? sortOrderDefault} onChange={onSortOrderRatioSet}>
          <div className="flex flex-col gap-1.5">
            {sortOrders.map(so => (
              <Radio
                key={so} value={so}
                classNames={{label: 'text-[15px]'}}
                label={t(`sort_order_type.${so}`)}
              />
            ))}
          </div>
        </RadioGroup>
        <Switch
          className="mt-1"
          label={t('sort_reversed')}
          checked={ds.sortReversed}
          onChange={event => onSortReversedCheckboxSet(event.currentTarget.checked)}
        />
      </CardSection>
    </SidebarCard>
  )
}
