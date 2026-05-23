import { AllOfAPlugin, PluginUpdateReport } from "./meta-types";

export function hasPluginUpdateReportEntries(report: PluginUpdateReport | null | undefined): boolean {
  return (report?.failures?.length ?? 0) > 0 || (report?.warnings?.length ?? 0) > 0
}

export function hasPluginUpdateReport(plugin: AllOfAPlugin): boolean {
  return hasPluginUpdateReportEntries(plugin.update_report)
}
