type PluginTab = 'introduction' | 'readme' | 'releases' | 'dependencies'

class Routes {
  home = () => '/'
  catalogue = () => '/plugins'

  pluginBase = () => '/plugin'
  plugin(pluginId: string) {
    return this.pluginBase() + '/' + pluginId;
  }

  pluginTab(pluginId: string, tab: PluginTab) {
    return this.plugin(pluginId) + '/' + tab
  }
  pluginRelease(pluginId: string, version: string) {
    return this.plugin(pluginId) + '/release/' + version
  }
}

export const routes = new Routes()
