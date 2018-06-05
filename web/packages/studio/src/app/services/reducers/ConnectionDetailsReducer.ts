import { ConnectionDetails, ConnectionSetupActionParams, PlexusConnectedActionParams } from '../ui/AppModel';
import { Action } from '@ngrx/store';
import { AppActions } from '../ui/AppActions';
import { getPayload } from './TypedAction';

export function connectionDetailsReducer(state: ConnectionDetails, action: Action): ConnectionDetails {
    switch (action.type) {
        case AppActions.CONNECTION_SETUP_START:
            const payload = getPayload<ConnectionSetupActionParams>(action).connectionDetails;
            return {
                ...payload,
                connected: false
            };
        case AppActions.CONNECTION_SETUP_SUCCESS:
            return {
                ...state,
                connected: true
            };
        default:
            return state;
    }
}