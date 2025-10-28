import { ConductorInternalError } from "../../common/errors";
import { checkIsPluginClass, type IConduit, type IChannel } from "../../conduit";
import type { IInterfacableEvaluator } from "../runner";
import type { IDataHandler, ExternCallable, IFunctionSignature } from "../types";
import type { IModulePlugin, IModuleExport } from "./types";

@checkIsPluginClass
export abstract class BaseModulePlugin implements IModulePlugin {
    abstract id: string;
    readonly exports: IModuleExport[] = [];
    readonly exportedNames: readonly (keyof this)[] = [];

    readonly evaluator: IDataHandler;

    static readonly channelAttach: string[];
    constructor(_conduit: IConduit, _channels: IChannel<any>[], evaluator: IInterfacableEvaluator) {
        this.evaluator = evaluator;
    }

    async initialise() {
        for (const name of this.exportedNames) {
            const m = this[name] as ExternCallable<any, any> & {signature?: IFunctionSignature<any, any>};
            if (!m.signature || typeof m !== "function" || typeof name !== "string") throw new ConductorInternalError(`'${String(name)}' is not an exportable method`);
            const c = await this.evaluator.closure_make(m.signature, m);
            this.exports.push({
                symbol: name,
                value: c,
                signature: m.signature
            });
        }
    }
}
