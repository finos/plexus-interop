import { TypedAction } from './TypedAction';
import { AppRegistryService } from '@plexus-interop/broker';
import { InteropServiceFactory } from './InteropServiceFactory';
import { AppActions } from './app.actions';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Action } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import * as fromAlerts from './reducers/alerts';

@Injectable()
export class Effects {
    @Effect() connectToPlexus$: Observable<TypedAction<any>> = this
        .actions$
        .ofType<TypedAction<string>>(AppActions.METADATA_LOAD_START)
        .mergeMap(action => {
            const baseUrl = action.payload;
            const interopRegistryServicePromise = this.interopServiceFactory.getInteropRegistryService(baseUrl);
            const appRegistryServicePromise = this.interopServiceFactory.getAppRegistryService(baseUrl);

            return Promise
                .all([interopRegistryServicePromise, appRegistryServicePromise])
                .then(([interopRegistryService, appRegistryService]) => {
                    const apps = appRegistryService.getApplications();

                    return { type: AppActions.METADATA_LOAD_SUCCESS, payload: apps };
                },
                error => ({ type: fromAlerts.Actions.ALERT_ERROR, payload: error }));
        });

    constructor(
        private http: Http,
        private actions$: Actions,
        private interopServiceFactory: InteropServiceFactory
    ) { }
}