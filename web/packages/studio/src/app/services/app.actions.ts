import { App } from './model';
import { Injectable } from '@angular/core';
import { TypedAction } from './TypedAction';
import { Action } from 'redux';

@Injectable()
export class AppActions {
    static CONNECT_LOADING_START = 'CONNECT_LOADING_START';
    static CONNECT_TO_PLEXUS = 'CONNECT_TO_PLEXUS';
    static DISCONNECT_FROM_PLEXUS = 'DISCONNECT_FROM_PLEXUS';
    static DISCONNECT_FROM_APP = 'DISCONNECT_FROM_APP';
    static CONNECT_TO_APP = 'CONNECT_TO_APP';

    connect(metadataUrl: string): TypedAction<string> {
        return { type: AppActions.CONNECT_TO_PLEXUS, payload:  metadataUrl};
    }

    disconnect(): Action {
        return { type: AppActions.DISCONNECT_FROM_PLEXUS };
    }

    disconnectFromApp(): Action {
        return { type: AppActions.DISCONNECT_FROM_APP };
    }

    connectToApp(app): TypedAction<App> {
        return {
            type: AppActions.CONNECT_TO_APP,
            payload: app
        };
    }

    startLoading(): Action {
        return { type: AppActions.CONNECT_LOADING_START };
    }
}
