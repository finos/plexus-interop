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
    loading: boolean,
    connected: boolean;
    metadataUrl: string;
    connectedApp: Application;
    consumedMethod: ConsumedMethodState,
    providedMethod: ProvidedMethodState,
    apps: Application[],
    services: ServicesSnapshot
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

export interface MetadataLoadActionParams {
    baseUrl: string,
    silentOnFailure: boolean
}

export interface Alert {
    message: string,
    type: AlertType
}

export enum AlertType {
    INFO, SUCCESS, USER_FAIL, ERROR
}

