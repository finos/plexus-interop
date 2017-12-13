import { Injectable } from '@angular/core';
import { Action } from 'redux';

@Injectable()
export class AppActions {
  static CONNECT_TO_PLEXUS = 'CONNECT_TO_PLEXUS';
  static DISCONNECT_FROM_PLEXUS = 'DISCONNECT_FROM_PLEXUS';

  connect(): Action {
    return { type: AppActions.CONNECT_TO_PLEXUS };
  }

  disconnect(): Action {
    return { type: AppActions.DISCONNECT_FROM_PLEXUS };
  }
}