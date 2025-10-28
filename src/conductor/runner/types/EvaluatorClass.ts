import type { IEvaluator } from "./IEvaluator";
import type { IInterfacableEvaluator } from "./IInterfacableEvaluator";
import type { IRunnerPlugin } from "./IRunnerPlugin";

export type EvaluatorClass<Arg extends any[] = []> = new (conductor: IRunnerPlugin, ...arg: Arg) => IEvaluator | IInterfacableEvaluator;
