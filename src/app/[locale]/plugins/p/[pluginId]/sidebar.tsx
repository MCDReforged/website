import { SimplePlugin } from "@/catalogue/simple-types";
import { Link } from "@/common/navigation";
import { GithubIcon } from "@/components/icons";
import MyCard from "@/components/ui/my-card";
import { PluginLabel } from "@/components/ui/plugin/plugin-label";
import { translateLangDict } from "@/utils/i18n-utils";
import { formatTime } from "@/utils/time-utils";
import { Tooltip } from "@mantine/core";
import { IconHome2 } from "@tabler/icons-react";
import { useLocale } from "next-intl";

export function Sidebar({plugin}: {plugin: SimplePlugin}) {
  const locale = useLocale()
  return (
    <div className="flex flex-col gap-5">
      <MyCard className="p-5">
        <div className="flex flex-col gap-3 break-words">
          <p className="text-2xl font-semibold">{plugin.name}</p>
          <p>{translateLangDict(locale, plugin.description) || ''}</p>
          <div className="flex flex-row flex-wrap gap-1">
            {plugin.labels.map(label => (
              <div key={label} className="">
                <PluginLabel label={label}/>
              </div>
            ))}
          </div>
        </div>
      </MyCard>

      <MyCard className="p-5">
        <div className="flex flex-col gap-2 break-words">
          <p>Last update: {formatTime(plugin.recentUpdated) || 'N/A'}</p>
          <p>Latest version: v{plugin.latestRelease?.version || 'N/A'}</p>

          <Link href={plugin.repos} className="flex gap-1 items-center">
            <Tooltip label="GitHub repository of the plugin">
              <GithubIcon/>
            </Tooltip>
            <p className="color-link">Repository</p>
          </Link>
          <Link href={plugin.reposHome} className="flex gap-1 items-center">
            <Tooltip label="Homepage of the plugin in the repository">
              <IconHome2 stroke={1.5}/>
            </Tooltip>
            <p className="color-link">Repository Plugin Home</p>
          </Link>
        </div>
      </MyCard>
    </div>
  )
}
