'use client'

import dayjs from "dayjs";
import { useLocale } from "next-intl";
import { useEffect } from "react";

export function useSetDayJsLocale() {
  const locale = useLocale()
  dayjs.locale(locale.toLowerCase())
  useEffect(() => {
    dayjs.locale(locale.toLowerCase())
    return () => {dayjs.locale(undefined)}
  }, [locale])
}

// color palette from grafana, licensed under AGPL-3.0 license
// https://github.com/grafana/grafana/blame/38c4f3d5ef8e37d7a0e0e3c493cde12f2bb30949/packages/grafana-data/src/themes/createVisualizationColors.ts#L225
export const colorPalette = [
  '#7EB26D',
  '#EAB839',
  '#6ED0E0',
  '#EF843C',
  '#E24D42',
  '#1F78C1',
  '#BA43A9',
  '#705DA0',
  '#508642',
  '#CCA300',
  '#447EBC',
  '#C15C17',
  '#890F02',
  '#0A437C',
  '#6D1F62',
  '#584477',
  '#B7DBAB',
  '#F4D598',
  '#70DBED',
  '#F9BA8F',
  '#F29191',
  '#82B5D8',
  '#E5A8E2',
  '#AEA2E0',
  '#629E51',
  '#E5AC0E',
  '#64B0C8',
  '#E0752D',
  '#BF1B00',
  '#0A50A1',
  '#962D82',
  '#614D93',
  '#9AC48A',
  '#F2C96D',
  '#65C5DB',
  '#F9934E',
  '#EA6460',
  '#5195CE',
  '#D683CE',
  '#806EB7',
  '#3F6833',
  '#967302',
  '#2F575E',
  '#99440A',
  '#58140C',
  '#052B51',
  '#511749',
  '#3F2B5B',
  '#E0F9D7',
  '#FCEACA',
  '#CFFAFF',
  '#F9E2D2',
  '#FCE2DE',
  '#BADFF4',
  '#F9D9F9',
  '#DEDAF7',
]
