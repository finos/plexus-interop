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
export function webSocketCtor(): any {
    const _window: any = window;
    if (_window && _window.WebSocket) {
        return _window.WebSocket;
    }
    const _global: any = global;
    if (_global && _global.WebSocket) {
        return _global.WebSocket;
    }
    const isNode = typeof global !== 'undefined' && ({}).toString.call(global) === '[object global]';
    if (isNode) {
        return require('websocket').w3cwebsocket;
    }
    throw new Error('WebSocket API is not found');
}