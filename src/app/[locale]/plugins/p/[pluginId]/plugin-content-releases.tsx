import { AllOfAPlugin, ReleaseInfo } from "@/catalogue/meta-types";
import { Link as NaLink } from "@/common/navigation";
import { PluginDownloadButton } from "@/components/ui/plugin/plugin-download-button";
import { formatTime } from "@/utils/time-utils";
import {
  ActionIcon,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Tooltip
} from "@mantine/core";
import { IconTag } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import React from "react";
import { TabBody } from "./plugin-content-common"
import { PrettySize } from "./utils";

function PluginReleasePageButton({release}: {release: ReleaseInfo}) {
  const tooltip = `External release page for ${release.meta.version}`
  const version = release.meta.version
  const ariaLabel = `See release page for v${version}`
  return (
    <Tooltip label={tooltip}>
      <ActionIcon color="blue" aria-label={ariaLabel}>
        <NaLink href={release.url} aria-label={ariaLabel} target="_blank">
          <IconTag stroke={1.5}/>
        </NaLink>
      </ActionIcon>
    </Tooltip>
  )
}

export function PluginContentReleases({plugin}: {plugin: AllOfAPlugin}) {
  const t = useTranslations('PluginPage.releases');

  const titles = (
    <TableTr>
      <TableTh>{t('version')}</TableTh>
      <TableTh>{t('file')}</TableTh>
      <TableTh>{t('date')}</TableTh>
      <TableTh>{t('size')}</TableTh>
      <TableTh>{t('downloads')}</TableTh>
      <TableTh>{t('actions')}</TableTh>
    </TableTr>
  )
  const rows = plugin.release.releases.map((ri) => {
    const version = ri.meta.version
    const date = new Date(ri.asset.created_at)
    return (
      <TableTr key={ri.tag_name}>
        <TableTd className="whitespace-nowrap">{version}</TableTd>
        <TableTd>
          <Tooltip label={ri.asset.name}><p>{ri.asset.name}</p></Tooltip>
        </TableTd>
        <TableTd className="whitespace-nowrap">
          {formatTime(date , 'YYYY/MM/DD')}
        </TableTd>
        <TableTd>
          <Tooltip label={`${ri.asset.size} ${t('bytes')}`}>
            <p>{PrettySize(ri.asset.size)}</p>
          </Tooltip>
        </TableTd>
        <TableTd>{ri.asset.download_count}</TableTd>
        <TableTd>
          <div className="flex flex-row gap-2">
            <PluginDownloadButton release={ri}/>
            <PluginReleasePageButton release={ri}/>
          </div>
        </TableTd>
      </TableTr>
    )
  })

  return (
    <TableScrollContainer minWidth={400} className="pb-0">
      <TabBody>
        <Table>
          <TableThead className="whitespace-nowrap">{titles}</TableThead>
          <TableTbody>{rows}</TableTbody>
        </Table>
      </TabBody>
    </TableScrollContainer>
  )
}
