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

const globalObj: any = global || window;

export function readEncodedConfig(): any {

    // tslint:disable-next-line:no-string-literal
    if (globalObj['__karma__']) {
        // tslint:disable-next-line:no-string-literal        
        return globalObj['__karma__'].config;
    }

    let env: any;
    if (globalObj.require('is-electron-renderer')) {
        env = globalObj.require('electron').remote.process.env;
    } else {
        env = process.env;
    }
    return {
        wsUrl: env.PLEXUS_BROKER_WEBSOCKET_URL,
        hostPath: env.PLEXUS_BROKER_HOST_URL
    }
}

export function readWsUrl(): string {
    const wsUrl = readEncodedConfig().wsUrl;
    if (wsUrl) {
        return wsUrl;
    } else {
        throw Error('wsUrl is undefined');
    }
}

export function readHostUrl(): string {
    const hostUrl = readEncodedConfig().hostPath;
    if (hostUrl) {
        return hostUrl;
    } else {
        throw Error('hostUrl is undefined');
    }
}
