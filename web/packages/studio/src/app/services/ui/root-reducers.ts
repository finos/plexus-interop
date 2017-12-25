import { StudioState } from './model';
import {
  ActionReducerMap,
  createSelector,
  createFeatureSelector,
  ActionReducer,
  MetaReducer,
} from '@ngrx/store';
import { environment } from '../../../environments/environment';

import * as fromRouter from '@ngrx/router-store';
import * as fromPlexus from './plexus-reducers';

export interface State {
  plexus: StudioState;
}

export const reducers: ActionReducerMap<State> = {
  plexus: fromPlexus.reducer
};

export function logger(reducer: ActionReducer<State>): ActionReducer<State> {
  return function (state: State, action: any): State {
    let result = reducer(state, action);
    
    console.log('Action: ', action);
    console.log('State: ', result);  

    return result;
  };
}

export const metaReducers: MetaReducer<State>[] = [logger];
