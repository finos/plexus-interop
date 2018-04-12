/**
 * Copyright 2018 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { StudioState } from './AppModel';
import {
  ActionReducerMap,
  createSelector,
  createFeatureSelector,
  ActionReducer,
  MetaReducer,
} from '@ngrx/store';
import { environment } from '../../../environments/environment';

import * as fromRouter from '@ngrx/router-store';
import * as fromPlexus from './PlexusReducers';
import { LoggerFactory } from '@plexus-interop/common';

export interface State {
  plexus: StudioState;
}

export const reducers: ActionReducerMap<State> = {
  plexus: fromPlexus.reducer
};

const log = LoggerFactory.getLogger('StateLogger');

export function logger(reducer: ActionReducer<State>): ActionReducer<State> {
  return function (state: State, action: any): State {
    let result = reducer(state, action);
    log.debug('Action:', action);
    log.debug('State:', result);  
    return result;
  };
}

export const metaReducers: MetaReducer<State>[] = [logger];
