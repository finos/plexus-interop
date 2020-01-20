/**
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Logger } from '../../logger/Logger';
import { default as Queue } from 'typescript-collections/dist/lib/Queue';
import { AsyncHelper } from './AsyncHelper';
import { LoggerFactory } from '../../logger/LoggerFactory';

type PendingTask = {
    id: number,
    task: () => Promise<void>;
};

export class SequencedExecutor {

    private outQueue: Queue<PendingTask> = new Queue<PendingTask>();

    private currentId: number = 0;

    constructor(private readonly log: Logger = LoggerFactory.getLogger('SequencedExecutor')) { }

    public async submit(task: () => Promise<void>): Promise<void> {
        const id = ++this.currentId;
        /* istanbul ignore if */
        if (this.log.isTraceEnabled()) {
            this.log.trace(`Scheduling [${id}] task`);
        }
        this.outQueue.enqueue({
            id: this.currentId,
            task
        });
        if (this.outQueue.size() > 1) {
            /* istanbul ignore if */
            if (this.log.isTraceEnabled()) {
                this.log.trace(`Waiting for [${id}] task to execute`);
            }
            await AsyncHelper.waitFor(() => this.outQueue.peek().id === id);
        }
        try {
            /* istanbul ignore if */
            if (this.log.isTraceEnabled()) {
                this.log.trace(`Executing [${id}] task`);
            }
            await this.outQueue.peek().task();
        } finally {
            this.outQueue.dequeue();
        }
    }
}