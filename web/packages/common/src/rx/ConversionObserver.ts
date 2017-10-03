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
import { Observer } from "./Observer";

export class ConversionObserver<S, D> implements Observer<D> {

    constructor(
        private readonly source: Observer<S>, 
        private readonly converter: (from: D) => S) {}


    public next(value: D): void {
        const after: S = this.converter(value);
        this.source.next(after);
    }

    public error(err: any): void {
        this.source.error(err);
    } 

    public complete(): void {
        this.source.complete();
    };


}