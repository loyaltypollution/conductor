export interface IPlugin {
    /** The id of the plugin. */
    readonly id: string;

    /**
     * Perform any cleanup of the plugin (e.g. closing message queues).
     */
    destroy?(): void;
}
