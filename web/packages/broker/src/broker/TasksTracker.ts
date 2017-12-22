import { Completion, ClientProtocolUtils } from "@plexus-interop/protocol";

export class TasksTracker {

    // tslint:disable-next-line:typedef
    private readonly tasks = new Map<string, Promise<Completion>>();

    public async start(id: string, task: () => Promise<Completion>): Promise<Completion> {
        const resultPromise = task();
        this.tasks.set(id, resultPromise);
        try {
            return await resultPromise;
        } finally {
            this.tasks.delete(id);
        }
    }

    public async completePending(): Promise<Completion> {
        const pendingTasks = this.tasks.values();
        const results = await Promise.all(pendingTasks);
        return ClientProtocolUtils.createSummarizedCompletion(...results);
    }

}