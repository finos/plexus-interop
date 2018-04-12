/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
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
import { InvocationObserver } from './InvocationObserver';
import { ConversionObserver } from '@plexus-interop/common';

export class InvocationObserverConverter<S, D> extends ConversionObserver<S, D> implements InvocationObserver<D>  {

    private baseSource: InvocationObserver<S>;

    constructor(
        source: InvocationObserver<S>,
        converter: (from: D) => S) {
        super(source, converter);
        this.baseSource = source;
    }

    public streamCompleted(): void {
        return this.baseSource.streamCompleted();
    }

}