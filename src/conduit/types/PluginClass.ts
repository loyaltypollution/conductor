import type { IChannel } from "./IChannel";
import type { IConduit } from "./IConduit";
import type { IPlugin } from "./IPlugin";

export type PluginClass<Arg extends any[] = [], T = IPlugin> = {
    readonly channelAttach: string[];
} & (new (conduit: IConduit, channels: IChannel<any>[], ...arg: Arg) => T);
