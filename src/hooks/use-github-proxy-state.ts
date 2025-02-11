import { storeKeys } from "@/site/store-key";
import { decorateWithGitHubProxy } from "@/utils/github-proxy-utils";
import { useLocalStorage } from "@mantine/hooks";

export function useGithubProxyState() {
  const [value, setValue, removeValue] = useLocalStorage<boolean>({
    key: storeKeys.pluginDownloadProxied,
    defaultValue: false,
  })

  return {
    proxied: value,
    setProxied: (newValue: boolean | undefined) => {
      if (newValue === undefined) {
        removeValue()
      } else {
        setValue(newValue)
      }
    }
  }
}

export function useGithubProxyUrl(rawUrl: string) {
  const {proxied} = useGithubProxyState()

  let url = rawUrl
  if (proxied) {
    url = decorateWithGitHubProxy(rawUrl)
  }

  return {proxied, url, rawUrl}
}
