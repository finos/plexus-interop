/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
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
import { App as Application } from '@plexus-interop/broker';
import { TypedAction } from '../ui/TypedAction';
import { Action } from '@ngrx/store';

export class Actions {

    public static readonly ALERT_INFO = 'ALERT_INFO';

    public static readonly ALERT_ERROR = 'ALERT_ERROR';
    
    public static readonly ALERT_USER_FAIL = 'ALERT_USER_FAIL';

}

export enum AlertType {
    INFO, SUCCESS, USER_FAIL, ERROR
}

export interface Alert {
    message: string,
    type: AlertType
}

export interface State {
    alerts: Alert[]
}

const initialState: State = {
    alerts: []
};

export function reducer(
    state: State = initialState,
    action: Action
): State {
    let stringAction = <TypedAction<string>>action;
    let type: AlertType;

    switch (action.type) {
        case Actions.ALERT_INFO:
            type = AlertType.INFO
            break;
        case Actions.ALERT_INFO:
            type = AlertType.INFO
            break;
        case Actions.ALERT_INFO:
            type = AlertType.INFO
            break;
    }

    return {
        alerts: [...state.alerts, { message: stringAction.payload, type: type }]
    };
}
