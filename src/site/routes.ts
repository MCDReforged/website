type PluginTab = 'introduction' | 'readme' | 'releases' | 'dependencies'

class Routes {
  home = () => '/'
  catalogue = () => '/plugins'

  plugin(pluginId: string) {
    return '/plugin/' + pluginId;
  }

  pluginTab(pluginId: string, tab: PluginTab) {
    return this.plugin(pluginId) + '/' + tab
  }
  pluginRelease(pluginId: string, version: string) {
    return this.plugin(pluginId) + '/release/' + version
  }
}

export const routes = new Routes()
