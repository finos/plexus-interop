import { State } from './reducers';
import { Injectable } from '@angular/core';
import { TypedAction } from './TypedAction';
import { Action } from 'redux';

@Injectable()
export class AppActions {
    
    static METADATA_LOAD_START = 'METADATA_LOAD_START';

    static METADATA_LOAD_FAILED = 'METADATA_LOAD_FAILED';
    
    static METADATA_LOAD_SUCCESS = 'METADATA_LOAD_SUCCESS';
    
    static DISCONNECT_FROM_PLEXUS = 'DISCONNECT_FROM_PLEXUS';
    
    static DISCONNECT_FROM_PLEXUS_SUCCESS = 'DISCONNECT_FROM_PLEXUS_SUCCESS';

    static SELECT_CONSUMED_METHOD = 'SELECT_CONSUMED_METHOD';

    static CONSUMED_METHOD_SUCCESS = 'CONSUMED_METHOD_SUCCESS';

    static SELECT_PROVIDED_METHOD = 'SELECT_PROVIDED_METHOD';
    
    static DISCONNECT_FROM_APP = 'DISCONNECT_FROM_APP';
    
    static DISCONNECT_FROM_APP_SUCCESS = 'DISCONNECT_FROM_APP_SUCCESS';
    
    static CONNECT_TO_APP_START = 'CONNECT_TO_APP_START';

    static CONNECT_TO_APP_FAILED = 'CONNECT_TO_APP_FAILED';

    static CONNECT_TO_APP_SUCCESS = 'CONNECT_TO_APP_SUCCESS';

    static DO_NOTHING = 'DO_NOTHING';

    static ALERT_ERROR = 'ALERT_ERROR';
    
    static AUTO_CONNECT = 'AUTO_CONNECT';
}
