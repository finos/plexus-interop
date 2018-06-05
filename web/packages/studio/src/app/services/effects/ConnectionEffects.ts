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
import { UrlParamsProvider, Logger, LoggerFactory } from '@plexus-interop/common';
import { DefaultConnectionDetailsService } from '@plexus-interop/client';
import { TypedAction } from '../reducers/TypedAction';
import { ConnectionRequestParams } from '../ui/ConnectionRequestParams';
import { TransportConnectionFactory } from '../core/TransportConnectionFactory';
import { InteropServiceFactory } from '../core/InteropServiceFactory';

const discoveryService: DefaultConnectionDetailsService = new DefaultConnectionDetailsService();
const requestParams = new ConnectionRequestParams()
const log: Logger = LoggerFactory.getLogger('ConnectionEffects');

export async function autoConnectEffect(state: StudioState) {
    const metadataUrl = await lookupMetadataUrl();
    if (metadataUrl) {
        const wsUrl = requestParams.getWsUrl();
        const proxyHostUrl = await lookupHostProxyUrl();
        const appsMetadataUrl = await lookupAppsUrl();
        const payload: ConnectionSetupActionParams = {
            connectionDetails: {
                generalConfig: {
                    metadataUrl,
                    transportType: await lookupTransportType()
                },
                wsConfig: wsUrl ? { wsUrl } : null,
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

export async function connectionSetupEffect(
    params: ConnectionSetupActionParams,
    transportConnectionFactory: TransportConnectionFactory,
    interopServiceFactory: InteropServiceFactory,
) {
    const connectionDetails = params.connectionDetails;
    const metadataUrl = connectionDetails.generalConfig.metadataUrl;
    try {
        const interopRegistryService = await interopServiceFactory.getInteropRegistryService(metadataUrl);
        const apps = interopRegistryService.getRegistry().applications.valuesArray();
        log.info(`Successfully loaded metadata from ${metadataUrl}`);

        const сonnectionProvider = await transportConnectionFactory.getConnectionProvider(connectionDetails);
        log.info(`Connection provider created`);
        return {
            type: AppActions.CONNECTION_SETUP_SUCCESS,
            payload: {
                apps,
                interopRegistryService,
                сonnectionProvider
            }
        };
    } catch (error) {
        const msg = `Connection not successful. Please check your connection setup.`;
        console.error('Failed to connect', error);
        if (params.silentOnFailure) {
            log.info(msg);
        } else {
            log.error(msg);
            return {
                type: AppActions.DISCONNECT_FROM_PLEXUS
            };
        };
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
    return nullable(requestParams.getHostProxyUrl())
        .catch(() => StudioExtensions.getProxyHostUrl())
        .catch(() => null);
}

function lookupMetadataUrl(): Promise<string> {
    return nullable(requestParams.getMetadataUrl())
        .catch(() => discoveryService.getMetadataUrl())
        .catch(e => StudioExtensions.getMetadataUrl())
        .catch(() => null);
}

function lookupAppsUrl(): Promise<string> {
    return nullable(requestParams.getAppsUrl())
        .catch(() => StudioExtensions.getAppsUrl())
        .catch(() => null);
}

function nullable(value: string): Promise<string> {
    return !!value ? Promise.resolve(value) : Promise.reject('Value is empty');
}