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
import { CancellationToken } from './CancellationToken';

export class ReadWriteCancellationToken {

    constructor(
        private readonly readToken: CancellationToken = new CancellationToken(),
        private readonly writeToken: CancellationToken = new CancellationToken()
    ) {}

    public cancelRead(reason: string = 'Read cancelled'): void {
        this.readToken.cancel(reason);
    }

    public cancelWrite(reason: string = 'Write cancelled'): void {
        this.writeToken.cancel(reason);
    }

    public throwIfCanceled(): void {
        if (this.isCancelled()) {
            throw Error(this.readToken.getReason() || this.writeToken.getReason() || 'Cancelled');
        }
    }

    public isCancelled(): boolean {
        return this.readToken.isCancelled() && this.writeToken.isCancelled();
    } 

    public cancel(reason: string = 'Cancelled'): void {
        this.cancelRead(reason);
        this.cancelWrite(reason);
    }

    public isReadCancelled(): boolean {
        return this.readToken.isCancelled();
    }

    public isWriteCancelled(): boolean {
        return this.writeToken.isCancelled();
    }

    public getReadToken(): CancellationToken {
        return this.readToken;
    }

    public getWriteToken(): CancellationToken {
        return this.writeToken;
    }

}