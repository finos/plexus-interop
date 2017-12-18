
import { App as Application } from '@plexus-interop/broker';
import { TypedAction } from '../TypedAction';
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
