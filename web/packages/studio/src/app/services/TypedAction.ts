import { Action } from 'redux';

export interface TypedAction<P> extends Action {
    payload: P;
    error?: boolean;
}