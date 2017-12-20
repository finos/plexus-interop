/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
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
import { App as Application, ConsumedMethod, ProvidedMethod } from "@plexus-interop/broker";
import { TypedAction } from './TypedAction';
import { InteropRegistryService } from '@plexus-interop/broker';
import { AppActions } from "./app.actions";
import { Action } from '@ngrx/store';
import { UrlParamsProvider } from "../core/UrlParamsProvider";
import {
    AppConnectedActionParams,
    ConsumedMethodState,
    MetadataLoadActionParams,
    PlexusConnectedActionParams,
    StudioState,
} from './model';

const mode = UrlParamsProvider.getParam("mode");

const defaultUrl = UrlParamsProvider.getParam("baseUrl") || mode === "dev" ? "http://localhost:8080" : undefined;

const initialState: StudioState = {
    loading: false,
    connected: false,
    metadataUrl: defaultUrl,
    connectedApp: undefined,
    consumedMethod: undefined,
    providedMethod: undefined,
    apps: [],
    services: {
        interopRegistryService: undefined,
        interopClient: undefined,
        сonnectionProvider: undefined
    }
};

function getPayload<T>(action: Action): T {
    return (<TypedAction<T>>action).payload;
};

export function reducer(
    state: StudioState = initialState,
    action: Action
): StudioState {
    switch (action.type) {
        case AppActions.METADATA_LOAD_START:
            return {
                ...initialState,
                metadataUrl: getPayload<MetadataLoadActionParams>(action).baseUrl,
                loading: true
            };
        case AppActions.METADATA_LOAD_SUCCESS:
            let payload = getPayload<PlexusConnectedActionParams>(action);
            return {
                ...state,
                connected: true,
                apps: payload.apps,
                services: {
                    ...state.services,
                    interopRegistryService: payload.interopRegistryService,
                    сonnectionProvider: payload.сonnectionProvider
                },
                loading: false
            };
        case AppActions.METADATA_LOAD_FAILED:
            return {
                ...initialState
            };
        case AppActions.DISCONNECT_FROM_PLEXUS:
            return {
                ...state
            };
        case AppActions.DISCONNECT_FROM_PLEXUS_SUCCESS:
            return {
                ...initialState
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
        case AppActions.CONSUMED_METHOD_SUCCESS:
            return {
                ...state,
                consumedMethod: getPayload<ConsumedMethodState>(action)
            };
        default:
            return state;
    }
}
