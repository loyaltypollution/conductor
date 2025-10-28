export interface IHostPluginRpc {
    $requestLoadPlugin(pluginId: string): void;
    queryPluginResolutions(pluginId: string): Record<string, string>;
}
