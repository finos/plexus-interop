import { App } from './model';
import { TypedAction } from './TypedAction';
import { Action } from 'redux';
import { AppActions } from './app.actions';

export interface IAppState {
    connected: boolean;
    metadataUrl: string | null;
    application: { name: string } | null
}

export const INITIAL_STATE: IAppState = {
    connected: false,
    metadataUrl: './metadata',
    application: null
};

export function rootReducer(state: IAppState, action: Action): IAppState {
    switch (action.type) {
        case AppActions.CONNECT_TO_PLEXUS:
            return {               
                ...state,
                connected: true,
                metadataUrl: '/metadata'
            };
        case AppActions.DISCONNECT_FROM_PLEXUS:
            return {
                connected: false,
                metadataUrl: null,
                application: null
            };
        case AppActions.DISCONNECT_FROM_APP:
            return {
                ...state,
                application: null
            };
        case AppActions.CONNECT_TO_APP:
            let typedAction = <TypedAction<App>>action;

            return {
                ...state,
                application: typedAction.payload
            };
    }

    // We don't care about any other actions right now.
    return state;
}