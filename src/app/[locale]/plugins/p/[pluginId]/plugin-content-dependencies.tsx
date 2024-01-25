import { AllOfAPlugin } from "@/catalogue/meta-types";
import { NaLink } from "@/components/na-link";
import { siteConfig } from "@/config/site";
import { Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from "@mantine/core";
import { clsx } from "clsx";
import { getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";
import React from "react";
import { TabBody } from "./plugin-content-common";

const DynamicPipInstallCodeHighlight = dynamic(
  () => import('./pip-install-code-highlight'),
)

export async function PluginContentDependencies({plugin}: { plugin: AllOfAPlugin }) {
  const t = await getTranslations('page.plugin.dependencies')
  const latestRelease = plugin.release.releases[plugin.release.latest_version_index ?? -1]
  const meta = latestRelease !== undefined ? latestRelease.meta : plugin.meta

  function SectionTitle({className, children}: {className?: string, children: React.ReactNode}) {
    return <p className={clsx("text-center text-xl font-bold", className)}>{children}</p>
  }

  const PipInstallCodeBlock = () => (
    <div className="mt-4 border-solid border border-mantine-border-card">
      <DynamicPipInstallCodeHighlight requirements={meta.requirements}/>
    </div>
  )
  const noneRow = (
    <TableTr>
      <TableTd><i className="text-mantine-dimmed select-none">{t('none')}</i></TableTd>
      <TableTd/>
    </TableTr>
  )

  return (
    <TabBody className="flex flex-col gap-5">
      <div className="max-lg:flex max-lg:flex-col lg:grid lg:grid-cols-2 gap-5">
        <div>
          <SectionTitle className="mb-2">{t('title_plugin')}</SectionTitle>
          <Table withTableBorder>
            <TableThead>
              <TableTr>
                <TableTh>{t('plugin_id')}</TableTh>
                <TableTh>{t('requirement')}</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {Object.entries(meta.dependencies).map(([pluginId, requirement], index) => {
                const id = pluginId.match(/^[a-zA-Z0-9_]+$/)?.toString()
                const pluginUrl = id === 'mcdreforged'
                  ? siteConfig.links.github
                  : (id !== undefined ? `/plugins/p/${pluginId}` : undefined)
                return (
                  <TableTr key={index}>
                    <TableTd>
                      {pluginUrl !== undefined
                        ? <NaLink href={pluginUrl} hoverColor>{pluginId}</NaLink>
                        : pluginId
                      }
                    </TableTd>
                    <TableTd>{requirement}</TableTd>
                  </TableTr>
                )
              })}
              {Object.keys(meta.dependencies).length == 0 && noneRow}
            </TableTbody>
          </Table>
        </div>

        <div>
          <SectionTitle className="mb-2">{t('title_package')}</SectionTitle>
          <Table withTableBorder className="mb-2">
            <TableThead>
              <TableTr>
                <TableTh>{t('py_package')}</TableTh>
                <TableTh>{t('requirement')}</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {meta.requirements.map((line, index) => {
                const pkg = line.match(/^[a-zA-z0-9._[\],-]+/)?.toString()
                const req = pkg !== undefined ? line.substring(pkg.length).trimStart() : ''
                const pkgUrl = pkg !== undefined ? `https://pypi.org/project/${pkg.match(/^[a-zA-Z0-9._-]+/)}/` : undefined
                return (
                  <TableTr key={index}>
                    <TableTd>
                      {pkgUrl !== undefined
                        ? <NaLink href={pkgUrl} hoverColor>{pkg}</NaLink>
                        : pkg || line
                      }
                    </TableTd>
                    <TableTd>{req}</TableTd>
                  </TableTr>
                )
              })}
              {meta.requirements.length == 0 && noneRow}
            </TableTbody>
          </Table>
        </div>

      </div>

      {meta.requirements.length > 0 &&
        <div>
          <SectionTitle>{t('py_package_command')}</SectionTitle>
          <PipInstallCodeBlock/>
        </div>
      }
      <div>
        <p className="text-end text-sm text-mantine-dimmed">
          {t('meta_source', {
            src: latestRelease !== undefined
              ? t('meta_source_latest_release', {version: meta.version})
              : t('meta_source_branch', {branch: plugin.plugin.branch})
          })}
        </p>
      </div>
    </TabBody>
  )
}
