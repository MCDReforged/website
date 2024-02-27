import { MetaInfo } from "@/catalogue/meta-types";
import { NaLink } from "@/components/na-link";
import { siteConfig } from "@/site/config";
import { routes } from "@/site/routes";
import { Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from "@mantine/core";
import { clsx } from "clsx";
import { getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";
import React from "react";

const DynamicPipInstallCodeHighlight = dynamic(
  () => import('./pip-install-code-highlight'),
)

async function NoneRow() {
  const t = await getTranslations('component.plugin_dependencies')
  return(
    <TableTr>
      <TableTd><i className="text-mantine-dimmed select-none">{t('none')}</i></TableTd>
      <TableTd/>
    </TableTr>
  )
}

async function PipInstallCodeBlock({requirements}: {requirements: string[]}) {
  return (
    <div className="mt-4 border-solid border border-mantine-border-card">
      <DynamicPipInstallCodeHighlight requirements={requirements}/>
    </div>
  )
}

async function SectionTitle({className, children}: {className?: string, children: React.ReactNode}) {
  return <p className={clsx("text-center text-xl font-bold", className)}>{children}</p>
}

export async function PluginRequirementTable({dependencies}: {dependencies: {[_: string]: string}}) {
  const t = await getTranslations('component.plugin_dependencies')
  return (
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
          {Object.entries(dependencies).map(([pluginId, requirement], index) => {
            const id = pluginId.match(/^[a-zA-Z0-9_]+$/)?.toString()
            const pluginUrl = id === 'mcdreforged'
              ? siteConfig.links.github
              : (id !== undefined ? routes.plugin(pluginId) : undefined)
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
          {Object.keys(dependencies).length == 0 && <NoneRow/>}
        </TableTbody>
      </Table>
    </div>
  )
}

export async function PackageRequirementTable({requirements}: {requirements: string[]}) {
  const t = await getTranslations('component.plugin_dependencies')
  return (
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
          {requirements.map((line, index) => {
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
          {requirements.length == 0 && <NoneRow/>}
        </TableTbody>
      </Table>
    </div>
  )
}

export async function PluginRequirementsPipCodeBlock({requirements}: {requirements: string[]}) {
  const t = await getTranslations('component.plugin_dependencies')
  return (
    <div>
      <SectionTitle>{t('py_package_command')}</SectionTitle>
      <PipInstallCodeBlock requirements={requirements}/>
    </div>
  )
}

export async function PluginDependenciesAll({meta}: { meta: MetaInfo }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="max-lg:flex max-lg:flex-col lg:grid lg:grid-cols-2 gap-5">
        <PluginRequirementTable dependencies={meta.dependencies}/>
        <PackageRequirementTable requirements={meta.requirements}/>
      </div>
      {meta.requirements.length > 0 && <PluginRequirementsPipCodeBlock requirements={meta.requirements}/>}
    </div>
  )
}
