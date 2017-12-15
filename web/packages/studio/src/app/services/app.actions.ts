import { App } from './model';
import { Injectable } from '@angular/core';
import { TypedAction } from './TypedAction';
import { Action } from 'redux';

@Injectable()
export class AppActions {
    static METADATA_LOAD_START = 'METADATA_LOAD_START';
    static METADATA_LOAD_FAILED = 'METADATA_LOAD_FAILED';
    static METADATA_LOAD_SUCCESS = 'METADATA_LOAD_SUCCESS';

    static DISCONNECT_FROM_PLEXUS = 'DISCONNECT_FROM_PLEXUS';
    static DISCONNECT_FROM_APP = 'DISCONNECT_FROM_APP';
    static CONNECT_TO_APP = 'CONNECT_TO_APP';
}
