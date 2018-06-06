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
import { ProvidedMethod } from '@plexus-interop/broker';
import { InteropClient } from '../core/InteropClient';
import { TransportConnectionProvider } from '../core/TransportConnectionProvider';
import { Application, ConsumedMethod } from '@plexus-interop/broker';
import { InteropRegistryService } from '@plexus-interop/broker';
import { TransportConnection } from '@plexus-interop/transport-common';
import { MethodDiscoveryResponse } from '@plexus-interop/client-api';

export interface ServicesSnapshot {
    interopRegistryService: InteropRegistryService,
    сonnectionProvider: TransportConnectionProvider,
    interopClient: InteropClient
}

export interface StudioState {
    connectionDetails: ConnectionDetails;
    loading: boolean,
    connectedApp: Application;
    consumedMethod: ConsumedMethodState,
    providedMethod: ProvidedMethodState,
    apps: Application[],
    services: ServicesSnapshot
}

export interface ConnectionDetails {
    generalConfig: GeneralConnectionConfig;
    webConfig?: WebConnectionConfig;
    wsConfig?: WebSocketConnectionConfig;
    connected: boolean;
}

export interface GeneralConnectionConfig {
    transportType: TransportType;
    metadataUrl: string;
}

export interface WebSocketConnectionConfig {
    wsUrl: string
}

export interface WebConnectionConfig {
    proxyHostUrl: string,
    // TODO deprecated, interop json + launcher should be used instead
    appsMetadataUrl: string
}

export interface ConsumedMethodState {
    method: ConsumedMethod;
    discoveredMethods: MethodDiscoveryResponse;
}

export interface ProvidedMethodState {
    method: ProvidedMethod;
}

export interface PlexusConnectedActionParams {
    apps: Application[],
    interopRegistryService: InteropRegistryService,
    сonnectionProvider: TransportConnectionProvider
}

export interface AppConnectedActionParams {
    interopClient: InteropClient,
    application: Application
}

export interface ConnectionSetupActionParams {
    connectionDetails: ConnectionDetails,
    silentOnFailure: boolean
}

export interface Alert {
    message: string,
    type: AlertType
};

export enum TransportType {
    WEB_SAME_BROADCAST = 'web-same-broadcast',
    WEB_CROSS = 'web-cross',
    NATIVE_WS = 'native-ws'
}

export const transportTypes: { key: TransportType, label: string }[] = [
    { key: TransportType.NATIVE_WS, label: 'Web Socket Transport' },
    { key: TransportType.WEB_CROSS, label: 'Cross Domain Web Transport' },
    { key: TransportType.WEB_SAME_BROADCAST, label: 'Same Domain Web Transport' }
];

export enum AlertType {
    INFO, SUCCESS, USER_FAIL, ERROR
}

