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
import { Observable } from 'rxjs/Observable';
import { isString } from '@plexus-interop/common';
import { ProvidedMethodReference } from '../metadata/interop/model/ProvidedMethodReference';
import { ConsumedMethodReference } from '../metadata/interop/model/ConsumedMethodReference';
import { ClientError } from '@plexus-interop/protocol';

export class Types {

    public static isObservable<T>(obj: any): obj is Observable<T> {
        return (obj as Observable<T>).subscribe !== undefined;
    }

    public static isConsumedMethodReference(methodReference: ConsumedMethodReference | ProvidedMethodReference): methodReference is ConsumedMethodReference {
        return !!(methodReference as ConsumedMethodReference).consumedService;
    }

    public static isError(value: any): value is Error {
        return value && value.stack && value.message;
    }

    public static toClientError(e: any): ClientError {
        if (Types.isError(e)) {
            return new ClientError(e.message, e.stack);
        } else if (isString(e)) {
            return new ClientError(e);
        } else if (e.message && e.details) {
            return new ClientError(e.message, e.details);
        } else {
            e = new Error('Unknown error received');
            return Types.toClientError(e);
        }
    }

}