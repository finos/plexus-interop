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
import { MethodType, DiscoveredMethod } from '@plexus-interop/client';
import { Logger, PrefixedLogger } from '@plexus-interop/common';
import { UniqueId } from '@plexus-interop/protocol';

export function createInvocationLogger(type: MethodType, id: number, baseLogger: Logger, target: DiscoveredMethod = null): Logger {
    const targetPostfix = target ? ` -> ${UniqueId.fromProperties(target.providedMethod.providedService.connectionId).toString()}` : '';
    switch (type) {
        case MethodType.Unary:
            return new PrefixedLogger(baseLogger, `[Unary ${id}${targetPostfix}]`);
        case MethodType.ServerStreaming:
            return new PrefixedLogger(baseLogger, `[ServerStreaming ${id}${targetPostfix}]`);
        case MethodType.ClientStreaming:
            return new PrefixedLogger(baseLogger, `[ClientStreaming ${id}${targetPostfix}]`);
        case MethodType.DuplexStreaming:
            return new PrefixedLogger(baseLogger, `[DuplexStreaming ${id}${targetPostfix}]`);
        default:
            throw new Error('Unknown type');
    }
}   