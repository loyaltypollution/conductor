import type { IPlugin } from "./IPlugin";
import type { PluginClass } from "./PluginClass";

export interface IConduit {
    /**
     * Register a plugin with the conduit.
     * @param pluginClass The plugin to be registered.
     * @param arg Arguments to be passed to pluginClass' constructor.
     */
    registerPlugin<Arg extends any[], T extends IPlugin>(pluginClass: PluginClass<Arg, T>, ...arg: Arg): NoInfer<T>;

    /**
     * Unregister a plugin from the conduit.
     * @param plugin The plugin to be unregistered.
     */
    unregisterPlugin(plugin: IPlugin): void;

    /**
     * Look for a plugin with the given ID.
     * @param pluginId The ID of the plugin to be searched for.
     */
    lookupPlugin(pluginId: string): IPlugin;

    /**
     * Shuts down the conduit.
     */
    terminate(): void;
}
