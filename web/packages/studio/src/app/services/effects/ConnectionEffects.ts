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
import { StudioState, ConnectionSetupActionParams, TransportType } from '../ui/AppModel';
import { AppActions } from '../ui/AppActions';
import { StudioExtensions } from '../extensions/StudioExtensions';
import { UrlParamsProvider } from '@plexus-interop/common';

const metadataUrlRequestParam: string = 'metadataUrl';
const appsUrlRequestParam: string = 'appsUrl';
const hostProxyUrlRequestParam: string = 'hostProxyUrl';
const wsUrlRequestParam: string = 'wsUrl';

export async function autoConnectEffect(state: StudioState) {
    const metadataUrl = await lookupMetadataUrl();
    if (metadataUrl) {
        const wsUrl = UrlParamsProvider.getParam(wsUrlRequestParam);
        const proxyHostUrl = await lookupHostProxyUrl();
        const appsMetadataUrl = await lookupAppsUrl();
        const payload: ConnectionSetupActionParams = {
            connectioDetails: {
                generalConfig: {
                    metadataUrl,
                    transportType: await lookupTransportType()
                },
                wsConfig: wsUrlRequestParam ? { wsUrl } : null,
                webConfig: proxyHostUrl && appsMetadataUrl ? { proxyHostUrl, appsMetadataUrl } : null,
                connected: false
            },
            silentOnFailure: true
        };
        return {
            type: AppActions.CONNECTION_SETUP_START,
            payload
        };
    } else {
        return { type: AppActions.DO_NOTHING };
    }
}

async function lookupTransportType(): Promise<TransportType> {
    const transport = UrlParamsProvider.getParam('transport');
    switch (transport) {
        case TransportType.WEB_SAME_BROADCAST:
            return TransportType.WEB_SAME_BROADCAST;
        case TransportType.WEB_CROSS:
            return TransportType.WEB_CROSS;
        case TransportType.NATIVE_WS:
        default:
            return TransportType.NATIVE_WS;
    }
}

function lookupHostProxyUrl(): Promise<string> {
    return StudioExtensions
        .getProxyHostUrl()
        .catch(e => UrlParamsProvider.getParam(hostProxyUrlRequestParam));
}

function lookupMetadataUrl(): Promise<string> {
    return StudioExtensions
        .getMetadataUrl()
        .catch(e => UrlParamsProvider.getParam(metadataUrlRequestParam));
}

function lookupAppsUrl(): Promise<string> {
    return StudioExtensions
        .getAppsUrl()
        .catch(e => UrlParamsProvider.getParam(appsUrlRequestParam));
}