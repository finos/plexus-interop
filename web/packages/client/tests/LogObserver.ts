/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
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
import { Observer } from "@plexus-interop/common";
import { UniqueId } from "@plexus-interop/transport-common";

export class LogObserver<T> implements Observer<T> {

    constructor(private _next?: (data: T) => void, private id: UniqueId = UniqueId.generateNew()) {}

    public complete(): void {
        console.log(`${this.id.toString()} - Complete`);
    }

    public next(data: T): void {
        console.log(`${this.id.toString()} - Next`, data);        
        if (this._next) {
            this._next(data);
        }
    }

    public error(error: any) {
        console.log(`${this.id.toString()} - Error`);
    }

}