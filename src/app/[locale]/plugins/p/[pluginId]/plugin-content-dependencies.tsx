import { AllOfAPlugin } from "@/catalogue/meta-types";
import { Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from "@mantine/core";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import React from "react";
import { TabBody } from "./plugin-content-common";

const DynamicPipInstallCodeHighlight = dynamic(
  () => import('./pip-install-code-highlight')
)

export function PluginContentDependencies({plugin}: { plugin: AllOfAPlugin }) {
  const t = useTranslations('PluginPage.dependencies')
  const latestRelease = plugin.release.releases[plugin.release.latest_version_index]
  const meta = latestRelease !== undefined ? latestRelease.meta : plugin.meta
  const metaSource = latestRelease !== undefined ? `Latest release v${meta.version}` : `${plugin.plugin.branch} branch`

  function SectionTitle({children}: {children: React.ReactNode}) {
    return <p className="text-center text-xl font-bold my-1">{children}</p>
  }

  const PipInstallCodeBlock = () => (
    <div className="mt-4 border-solid border border-[var(--mantine-color-gray-2)]">
      <DynamicPipInstallCodeHighlight requirements={meta.requirements}/>
    </div>
  )

  return (
    <TabBody className="flex flex-col gap-5">
      <div>
        <p>Source: {metaSource}</p>
        <SectionTitle>{t('title_plugin')}</SectionTitle>
        <Table withTableBorder>
          <TableThead>
            <TableTr>
              <TableTh>{t('plugin_id')}</TableTh>
              <TableTh>{t('requirement')}</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {Object.entries(meta.dependencies).map(([pluginId, requirement], index) => {
              return (
                <TableTr key={index}>
                  <TableTd>{pluginId}</TableTd>
                  <TableTd>{requirement}</TableTd>
                </TableTr>
              )
            })}
          </TableTbody>
        </Table>
      </div>

      <div>
        <SectionTitle>{t('title_package')}</SectionTitle>
        <Table withTableBorder className="mb-2">
          <TableThead>
            <TableTr>
              <TableTh>{t('py_package')}</TableTh>
              <TableTh>{t('requirement')}</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {meta.requirements.map((line, index) => {
              const pkg = line.match(/^[a-zA-z0-9._[\],-]+/)?.toString() || line
              const req = line.substring(pkg.length).trimStart()
              return (
                <TableTr key={index}>
                  <TableTd>{pkg}</TableTd>
                  <TableTd>{req}</TableTd>
                </TableTr>
              )
            })}
          </TableTbody>
        </Table>
        {meta.requirements.length > 0 && <PipInstallCodeBlock />}
      </div>
    </TabBody>
  )
}
