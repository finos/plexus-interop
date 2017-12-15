import { TypedAction } from './../TypedAction';
import { Application } from '@plexus-interop/broker/src/metadata/apps/model/Application';
import { AppActions } from '../app.actions';
import { Action } from '@ngrx/store';

export interface State {
    loading: boolean,
    connected: boolean;
    metadataUrl: string;
    connectedApp: Application;
    apps: Application[]
}

const initialState: State = {
    loading: false,
    connected: false,
    metadataUrl: '/',
    connectedApp: undefined,
    apps: []
};

function getPayload<T>(action: Action): T {
    return (<TypedAction<T>>action).payload;
};

export function reducer(
    state: State = initialState,
    action: Action
): State {

    switch (action.type) {
        case AppActions.METADATA_LOAD_START:
            return {
                ...initialState,
                metadataUrl: getPayload<string>(action),
                loading: true
            };
        case AppActions.METADATA_LOAD_SUCCESS:
            return {
                ...state,
                connected: true,
                apps: getPayload<Application[]>(action),
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
        case AppActions.CONNECT_TO_APP:
            return {
                ...state,
                connectedApp: getPayload<Application>(action)
            };
        default:
            return state;
    }
}
