import { Action } from '@ngrx/store';

export interface TypedAction<P> extends Action {
    payload: P;
    error?: boolean;
}