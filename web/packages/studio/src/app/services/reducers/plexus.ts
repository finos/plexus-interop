import { InteropClient } from '../InteropClient';
import { App as Application, ConsumedMethod } from "@plexus-interop/broker";
import { TypedAction } from './../TypedAction';
import { InteropRegistryService } from '@plexus-interop/broker';
import { AppActions } from "../app.actions";
import { Action } from '@ngrx/store';
import { AppConnectedActionParams, PlexusConnectedActionParams, StudioState, ConsumedMethodState } from '../model';

const initialState: StudioState = {
    loading: false,
    connected: false,
    metadataUrl: '/assets',
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
                metadataUrl: getPayload<string>(action),
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
                ...initialState
            };
        case AppActions.DISCONNECT_FROM_APP:
            return {
                ...state,
                connectedApp: null
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
