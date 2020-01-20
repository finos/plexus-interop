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
import { ReadOnlyCancellationToken } from './ReadOnlyCancellationToken';
import { Logger, LoggerFactory } from '../../logger';

const logger: Logger = LoggerFactory.getLogger('CancellationToken');

export type CancelListener = (reason: any) => void;

export class CancellationToken implements ReadOnlyCancellationToken {

    private cancelled: boolean = false;
    private reason: string = 'Not defined';
    private listeners: CancelListener[] = [];

    constructor(private readonly baseToken?: CancellationToken) { }

    public throwIfCanceled(): void {
        if (this.isCancelled()) {
            throw Error(this.getReason());
        }
    }

    public onCancel(callback: CancelListener): void {
        if (this.listeners.indexOf(callback) === -1) {
            this.listeners.push(callback);
        }
    }

    public isCancelled(): boolean {
        if (this.baseToken) {
            return this.cancelled || this.baseToken.isCancelled();
        } else {
            return this.cancelled;
        }
    }

    public cancel(reason: string = 'Operation cancelled'): void {
        if (!this.cancelled) {
            this.reason = reason;
            this.listeners.forEach(listener => {
                try {
                    listener(reason);
                } catch (error) {
                    logger.warn('Cancellation listener raised error', error);
                }
            });
            this.cancelled = true;
        }
    }

    public getReason(): string {
        return this.baseToken && this.baseToken.cancelled ? this.baseToken.getReason() : this.reason;
    }
}