import { TypedAction } from './TypedAction';
import { AppActions } from './app.actions';
import { App } from './model';
import { Action } from '@ngrx/store';

export interface State {
    loading: boolean,
    connected: boolean;
    metadataUrl: string | null;
    application: App | null;
}

const initialState: State = {
    loading: false,
    connected: false,
    metadataUrl: './metadata',
    application: null
};

export function reducer(
    state: State = initialState,
    action: Action
): State {
    switch (action.type) {
        case AppActions.METADATA_LOAD_START:
            return {
                connected: false,
                metadataUrl: null,
                loading: true,
                application: null
            };
        case AppActions.METADATA_LOAD_SUCCESS:
            return {
                connected: true,
                metadataUrl: './metadata',
                loading: true,
                application: null
            };
        case AppActions.METADATA_LOAD_FAILED:
            return {
                connected: false,
                metadataUrl: null,
                loading: false,
                application: null
            };
        case AppActions.DISCONNECT_FROM_PLEXUS:
            return {
                connected: false,
                metadataUrl: null,
                loading: false,
                application: null
            };
        case AppActions.DISCONNECT_FROM_APP:
            return {
                ...state,
                application: null
            };
        case AppActions.CONNECT_TO_APP:
            const typedAction = <TypedAction<App>>action;

            return {
                ...state,
                application: typedAction.payload
            };            
        default:
            return state;
    }
}
