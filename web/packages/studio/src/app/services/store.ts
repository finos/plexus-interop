import { Action } from 'redux';
import { AppActions } from './app.actions';

export interface IAppState {
    connected: boolean;
    metadataUrl: string | null;
}

export const INITIAL_STATE: IAppState = {
  connected: false,
  metadataUrl: null
};

export function rootReducer(lastState: IAppState, action: Action): IAppState {
  switch(action.type) {
    case AppActions.CONNECT_TO_PLEXUS: return { connected: true, metadataUrl: '/metadata' };
    case AppActions.DISCONNECT_FROM_PLEXUS: return { connected: false, metadataUrl: 'metadata://url' };
  }

  // We don't care about any other actions right now.
  return lastState;
}