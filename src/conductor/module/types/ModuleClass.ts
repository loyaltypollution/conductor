import type { PluginClass } from "../../../conduit";
import type { IEvaluator } from "../../runner";
import type { IModulePlugin } from "./IModulePlugin";

export type ModuleClass<T extends IModulePlugin = IModulePlugin> = PluginClass<[IEvaluator], T>;
