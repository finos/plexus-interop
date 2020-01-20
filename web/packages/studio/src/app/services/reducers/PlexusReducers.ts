/**
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
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
import { InteropClient } from '../core/InteropClient';
import { Application, ConsumedMethod, ProvidedMethod, InteropRegistryService } from '@plexus-interop/metadata';
import { TypedAction, getPayload } from './TypedAction';
import { AppActions } from '../ui/AppActions';
import { Action } from '@ngrx/store';
import { UrlParamsProvider } from '@plexus-interop/common';
import { MethodDiscoveryResponse } from '@plexus-interop/client-api';
import { GeneralConnectionConfig } from '../ui/AppModel';
import { connectionDetailsReducer } from './ConnectionDetailsReducer';

import {
    AppConnectedActionParams,
    ConsumedMethodState,
    ConnectionSetupActionParams,
    PlexusConnectedActionParams,
    StudioState,
    TransportType,
} from '../ui/AppModel';

const initialState: StudioState = {
    loading: false,
    connectionDetails: {
        generalConfig: {
            metadataUrl: null,
            transportType: TransportType.NATIVE_WS
        },
        connected: false
    },
    connectedApp: undefined,
    consumedMethod: undefined,
    providedMethod: undefined,
    appsFilter: undefined,
    serviceFilter: undefined,
    apps: [],
    services: {
        interopRegistryService: undefined,
        interopClient: undefined,
        �?onnectionProvider: undefined
    }
};

export function reducer(
    state: StudioState = initialState,
    action: Action
): StudioState {
    switch (action.type) {
        case AppActions.CONNECTION_SETUP_START:
            return {
                ...initialState,
                connectionDetails: connectionDetailsReducer(state.connectionDetails, action),
                loading: true
            };
        case AppActions.CONNECTION_SETUP_SUCCESS:
            let payload = getPayload<PlexusConnectedActionParams>(action);
            return {
                ...state,
                connectionDetails: connectionDetailsReducer(state.connectionDetails, action),
                apps: payload.apps,
                services: {
                    ...state.services,
                    interopRegistryService: payload.interopRegistryService,
                    �?onnectionProvider: payload.�?onnectionProvider
                },
                loading: false
            };
        case AppActions.CONNECTION_SETUP_FAILED:
            return {
                ...initialState
            };
        case AppActions.DISCONNECT_FROM_PLEXUS:
            return {
                ...state
            };
        case AppActions.DISCONNECT_FROM_PLEXUS_SUCCESS:
            return {
                ...initialState,
                // keep entered/discovered connection details
                connectionDetails: {
                    ...state.connectionDetails,
                    connected: false
                }
            };
        case AppActions.DISCONNECT_FROM_APP:
            return {
                ...state,
            };
        case AppActions.DISCONNECT_FROM_APP_SUCCESS:
            return {
                ...state,
                connectedApp: undefined,
                services: {
                    ...state.services,
                    interopClient: undefined
                }
            };
        case AppActions.SELECT_PROVIDED_METHOD:
            return {
                ...state,
                providedMethod: {
                    method: getPayload<ProvidedMethod>(action)
                }
            };
        case AppActions.CONNECT_TO_APP_SUCCESS:
            return {
                ...state,
                connectedApp: getPayload<AppConnectedActionParams>(action).application,
                services: {
                    ...state.services,
                    interopClient: getPayload<AppConnectedActionParams>(action).interopClient
                }
            };
        case AppActions.DISCOVER_METHODS_SUCCESS:
            return {
                ...state,
                consumedMethod: {
                    ...state.consumedMethod,
                    discoveredMethods: getPayload<MethodDiscoveryResponse>(action)
                }
            };
        case AppActions.CONSUMED_METHOD_SUCCESS:
            return {
                ...state,
                consumedMethod: getPayload<ConsumedMethodState>(action)
            };
        case AppActions.APPS_FILTER_UPDATED:
            return {
                ...state,
                appsFilter: getPayload<string>(action)
            };
        case AppActions.SERVICE_FILTER_UPDATED:
            return {
                ...state,
                serviceFilter: getPayload<string>(action)
            };
        default:
            return state;
    }
}
