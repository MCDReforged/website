'use client'

import { SimpleEverything } from "@/catalogue/simple-types";
import CommonCard from "@/components/common-card";
import { PluginLabel } from "@/components/plugin/plugin-label";
import { TimeAgoDynamic } from "@/components/time-ago-dynamic";
import { pluginLabels } from "@/config/catalogue";
import { Checkbox, Radio, RadioGroup, Switch, TextInput } from "@mantine/core";
import { IconFileDownload, IconFilter, IconPackages, IconRefresh, IconUser, IconUsers } from "@tabler/icons-react";
import { clsx } from "clsx";
import { useLocale, useTranslations } from "next-intl";
import React, { useContext } from "react";
import { DisplayStrategyContextValue, filterPlugins, sortOrders } from "./display-strategy";
import { DisplayStrategyContext } from "./display-strategy-provider";

function SidebarCard({children}: {children: React.ReactNode}) {
  return (
    <CommonCard className="p-5 overflow-hidden">
      <div className="flex flex-col gap-5">
        {children}
      </div>
    </CommonCard>
  )
}

function CardSection({title, className, children}: {title: React.ReactNode, children: React.ReactNode, className?: string}) {
  return (
    <div className={clsx('flex flex-col', className)}>
      <p className="text-lg font-bold">{title}</p>
      {children}
    </div>
  )
}

function FilterTextInput({Icon, onChanged, label, placeholder}: {
  Icon: typeof IconFilter, onChanged: (_: string) => void, label: string, placeholder: string
}) {
  return (
    <TextInput
      size="sm"
      leftSection={<Icon size={20} stroke={1.5}/>}
      onChange={(event) => onChanged(event.currentTarget.value)}
      aria-label={label}
      label={label}
      placeholder={placeholder}
      classNames={{label: 'font-normal'}}
    />
  )
}

function ControlCard({everything}: { everything: SimpleEverything }) {
  const t = useTranslations('page.plugin_list.sidebar')
  const {ds, setDs} = useContext<DisplayStrategyContextValue>(DisplayStrategyContext)
  const allPlugins = Object.values(everything.plugins)
  const filteredPlugins = filterPlugins(allPlugins, ds)

  const onNameFilterTextChanged = (text: string) => {
    setDs({...ds, nameKeyword: text})
  }
  const onAuthorFilterTextChanged = (text: string) => {
    setDs({...ds, authorKeyword: text})
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
    setDs({...ds, sortOrder: what})
  }
  const onSortReversedCheckboxSet = (checked: boolean) => {
    setDs({...ds, sortReversed: checked})
  }

  return (
    <SidebarCard>
      <CardSection title={t('plugin_filter')} className="gap-0.5">
        <FilterTextInput Icon={IconFilter} onChanged={onNameFilterTextChanged} label={t('plugin_filter_name')} placeholder="qbm"/>
        <FilterTextInput Icon={IconUser} onChanged={onAuthorFilterTextChanged} label={t('plugin_filter_author')} placeholder="fallen"/>
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
        <RadioGroup defaultValue={sortOrders[0]} onChange={onSortOrderRatioSet}>
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

function StatItem({Icon, text}: {Icon: typeof IconRefresh, text: React.ReactNode}) {
  return (
    <div className="flex flex-row gap-2 items-center">
      <Icon size={18} stroke={1.5}/>
      <>{text}</>
    </div>
  )
}

function StatsCard({everything}: { everything: SimpleEverything }) {
  const locale = useLocale()
  const t = useTranslations('page.plugin_list.sidebar');

  const allPlugins = Object.values(everything.plugins)
  const pluginAmount = allPlugins.length
  const authorAmount = everything.authors.amount
  const downloadSum = allPlugins.reduce((s, plugin) => s + plugin.downloads, 0)

  return (
    <SidebarCard>
      <CardSection title={t('stats')} className="gap-1">
        <StatItem Icon={IconRefresh} text={
          <div className="flex">
            <p className="whitespace-pre-wrap">{t('sync_at')}</p>
            <TimeAgoDynamic date={new Date(everything.timestamp * 1000)}/>
          </div>
        }/>
        <StatItem Icon={IconPackages} text={t('plugin_amount', {n: pluginAmount})}/>
        <StatItem Icon={IconUsers} text={t('author_amount', {n: authorAmount})}/>
        <StatItem Icon={IconFileDownload} text={t('download_sum', {n: downloadSum})}/>
      </CardSection>
    </SidebarCard>
  )
}

export function Sidebar({everything}: { everything: SimpleEverything }) {
  return (
    <div className="mx-[8px] flex flex-col gap-5">
      <ControlCard everything={everything} />
      <StatsCard everything={everything} />
    </div>
  )
}
