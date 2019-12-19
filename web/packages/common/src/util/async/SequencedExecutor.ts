/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Logger } from '../../logger/Logger';
import { LoggerFactory } from '../../logger/LoggerFactory';
import { uniqueId } from '../unique';

export interface PendingTask {
    id: string;
    task: () => Promise<void>;
    wrapperReject: (e: any) => void;
    wrapperResolve: () => void;
}

export class SequencedExecutor {

    private readonly _queue: PendingTask[] = [];

    private _workInProgress: boolean = false;

    constructor(private readonly log: Logger = LoggerFactory.getLogger('SequencedExecutor')) { }

    public submit(task: () => Promise<void>): Promise<void> {
        const id = uniqueId('seq-task');
        return new Promise((wrapperResolve, wrapperReject) => {
            /* istanbul ignore if */
            if (this.log.isTraceEnabled()) {
                this.log.trace(`Placing [${id}] task to queue`);
            }
            this._queue.push({
                id,
                wrapperReject,
                wrapperResolve,
                task
            });
            this._dequeue();
        });
    }

    private _dequeue(): void {

        if (this._workInProgress) {
            return;
        }

        const pendingTask = this._queue.shift();

        if (!pendingTask) {
            return;
        }

        try {

            this._workInProgress = true;

            /* istanbul ignore if */
            if (this.log.isTraceEnabled()) {
                this.log.trace(`Executing [${pendingTask.id}] task`);
            }

            pendingTask.task().then(() => {
                this._workInProgress = false;
                pendingTask.wrapperResolve();
                this._dequeue();
            })
                .catch(e => this._handleFailure(pendingTask, e));

        } catch (e) {
            this._handleFailure(pendingTask, e);
        }

    }

    private _handleFailure(task: PendingTask, e: any): void {
        this._workInProgress = false;
        task.wrapperReject(e);
        this._dequeue();
    }

}