import { Constant } from "../../common/Constant";
import type { ConductorError } from "../../common/errors";
import { ConductorInternalError } from "../../common/errors/ConductorInternalError";
import { importExternalPlugin, importExternalModule } from "../../common/util";
import { type IConduit, type IChannelQueue, ChannelQueue, makeRpc, checkIsPluginClass, type IChannel, type IPlugin, type PluginClass, type Remote } from "../../conduit";
import type { IHostFileRpc, IHostPluginRpc } from "../host";
import type { IModulePlugin, ModuleClass } from "../module";
import { InternalChannelName, InternalPluginId } from "../strings";
import { RunnerStatus, ServiceMessageType, HelloServiceMessage, AbortServiceMessage, type EntryServiceMessage, type Chunk, type IChunkMessage, type IErrorMessage, type IIOMessage, type IResultMessage, type IServiceMessage, type IStatusMessage, } from "../types";
import { type EvaluatorClass, type IEvaluator, type IInterfacableEvaluator, type IRunnerPlugin } from "./types";

@checkIsPluginClass
export class RunnerPlugin implements IRunnerPlugin {
    id = InternalPluginId.RUNNER_MAIN;

    private readonly __evaluator: IEvaluator | IInterfacableEvaluator;
    private readonly __isCompatibleWithModules: boolean;
    private readonly __conduit: IConduit;
    private readonly __fileRpc: Remote<IHostFileRpc>;
    private readonly __chunkQueue: IChannelQueue<IChunkMessage>;
    private readonly __serviceChannel: IChannel<IServiceMessage>;
    private readonly __ioQueue: IChannelQueue<IIOMessage>;
    private readonly __resultChannel: IChannel<IResultMessage>;
    private readonly __errorChannel: IChannel<IErrorMessage>;
    private readonly __statusChannel: IChannel<IStatusMessage>;
    private readonly __pluginRpc: Remote<IHostPluginRpc>;

    // @ts-expect-error TODO: figure proper way to typecheck this
    private readonly __serviceHandlers = new Map<ServiceMessageType, (message: IServiceMessage) => void>([
        [ServiceMessageType.HELLO, function helloServiceHandler(this: RunnerPlugin, message: HelloServiceMessage) {
            if (message.data.version < Constant.PROTOCOL_MIN_VERSION) {
                this.__serviceChannel.send(new AbortServiceMessage(Constant.PROTOCOL_MIN_VERSION));
                console.error(`Host's protocol version (${message.data.version}) must be at least ${Constant.PROTOCOL_MIN_VERSION}`);
            } else {
                console.log(`Host is using protocol version ${message.data.version}`);
            }
        }],
        [ServiceMessageType.ABORT, function abortServiceHandler(this: RunnerPlugin, message: AbortServiceMessage) {
            console.error(`Host expects at least protocol version ${message.data.minVersion}, but we are on version ${Constant.PROTOCOL_VERSION}`);
            this.__conduit.terminate();
        }],
        [ServiceMessageType.ENTRY, function entryServiceHandler(this: RunnerPlugin, message: EntryServiceMessage) {
            this.__evaluator.startEvaluator(message.data);
        }]
    ]);

    requestFile(fileName: string): Promise<string | undefined> {
        return this.__fileRpc.requestFile(fileName);
    }

    async requestChunk(): Promise<Chunk> {
        return (await this.__chunkQueue.receive()).chunk;
    }

    async requestInput(): Promise<string> {
        const { message } = await this.__ioQueue.receive();
        return message;
    }

    tryRequestInput(): string | undefined {
        const out = this.__ioQueue.tryReceive();
        return out?.message;
    }

    sendOutput(message: string): void {
        this.__ioQueue.send({ message });
    }

    sendResult(result: any): void {
        this.__resultChannel.send({ result });
    }

    sendError(error: ConductorError): void {
        this.__errorChannel.send({ error });
    }

    updateStatus(status: RunnerStatus, isActive: boolean): void {
        this.__statusChannel.send({ status, isActive });
    }

    hostLoadPlugin(pluginId: string): void {
        this.__pluginRpc.$requestLoadPlugin(pluginId);
    }

    async hostQueryPluginResolutions(pluginId: string): Promise<Record<string, string>> {
        return this.__pluginRpc.queryPluginResolutions(pluginId);
    }

    registerPlugin<Arg extends any[], T extends IPlugin>(pluginClass: PluginClass<Arg, T>, ...arg: Arg): NoInfer<T> {
        return this.__conduit.registerPlugin(pluginClass, ...arg);
    }

    unregisterPlugin(plugin: IPlugin): void {
        this.__conduit.unregisterPlugin(plugin);
    }

    registerModule<T extends IModulePlugin>(moduleClass: ModuleClass<T>): NoInfer<T> {
        if (!this.__isCompatibleWithModules) throw new ConductorInternalError("Evaluator has no data interface");
        return this.registerPlugin(moduleClass, this.__evaluator as IInterfacableEvaluator);
    }

    unregisterModule(module: IModulePlugin): void {
        this.unregisterPlugin(module);
    }

    async importAndRegisterExternalPlugin(location: string, ...arg: any[]): Promise<IPlugin> {
        const pluginClass = await importExternalPlugin(location);
        return this.registerPlugin(pluginClass as any, ...arg);
    }

    async importAndRegisterExternalModule(location: string): Promise<IModulePlugin> {
        const moduleClass = await importExternalModule(location);
        return this.registerModule(moduleClass);
    }

    static readonly channelAttach = [InternalChannelName.FILE, InternalChannelName.CHUNK, InternalChannelName.SERVICE, InternalChannelName.STANDARD_IO, InternalChannelName.RESULT, InternalChannelName.ERROR, InternalChannelName.STATUS, InternalChannelName.PLUGIN];
    constructor(
        conduit: IConduit,
        [fileChannel, chunkChannel, serviceChannel, ioChannel, resultChannel, errorChannel, statusChannel, pluginChannel]: IChannel<any>[],
        evaluatorClass: EvaluatorClass
    ) {
        this.__conduit = conduit;
        this.__fileRpc = makeRpc<{}, IHostFileRpc>(fileChannel, {});
        this.__chunkQueue = new ChannelQueue(chunkChannel);
        this.__serviceChannel = serviceChannel;
        this.__ioQueue = new ChannelQueue(ioChannel);
        this.__resultChannel = resultChannel;
        this.__errorChannel = errorChannel;
        this.__statusChannel = statusChannel;
        this.__pluginRpc = makeRpc<{}, IHostPluginRpc>(pluginChannel, {});

        this.__serviceChannel.send(new HelloServiceMessage());
        this.__serviceChannel.subscribe(message => {
            this.__serviceHandlers.get(message.type)?.call(this, message);
        });

        this.__evaluator = new evaluatorClass(this);
        this.__isCompatibleWithModules = (this.__evaluator as IInterfacableEvaluator).hasDataInterface ?? false;
    }
}
