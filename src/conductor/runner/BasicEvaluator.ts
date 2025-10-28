import { ConductorInternalError } from "../../common/errors";
import type { IEvaluator, IRunnerPlugin } from "./types";

export abstract class BasicEvaluator implements IEvaluator {
    readonly conductor: IRunnerPlugin;

    async startEvaluator(entryPoint: string): Promise<void> {
        const initialChunk = await this.conductor.requestFile(entryPoint);
        if (!initialChunk) throw new ConductorInternalError("Cannot load entrypoint file");
        this.conductor.sendResult(await this.evaluateFile(entryPoint, initialChunk));
        while (true) {
            const chunk = await this.conductor.requestChunk();
            this.conductor.sendResult(await this.evaluateChunk(chunk));
        }
    }

    /**
     * Evaluates a file.
     * @param fileName The name of the file to be evaluated.
     * @param fileContent The content of the file to be evaluated.
     * @returns A promise that resolves to the result of the file when the evaluation is complete.
     */
    async evaluateFile(fileName: string, fileContent: string): Promise<any> {
        return this.evaluateChunk(fileContent);
    }

    /**
     * Evaluates a chunk.
     * @param chunk The chunk to be evaluated.
     * @returns A promise that resolves to the result of the chunk when the evaluation is complete.
     */
    abstract evaluateChunk(chunk: string): Promise<any>;

    constructor(conductor: IRunnerPlugin) {
        this.conductor = conductor;
    }
}
