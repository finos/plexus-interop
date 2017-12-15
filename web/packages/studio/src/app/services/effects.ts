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
import { of } from 'rxjs/observable/of';

@Injectable()
export class Effects {
    @Effect() connectToPlexus$: Observable<Action> = this
        .actions$
        .ofType(AppActions.METADATA_LOAD_START)
        .mergeMap(action => {
            const interopRegistryServicePromise = this.interopServiceFactory.getInteropRegistryService('/assets/');
            const appRegistryServicePromise = this.interopServiceFactory.getAppRegistryService('/assets/');

            return Promise.all([interopRegistryServicePromise, appRegistryServicePromise]).then(([interopRegistryService, appRegistryServicePromise]) => {                
                return null;
            });

                // .get
                // .then(appRegistryService => {
                //     return null;
                // });

            // this.http.get('/assets/apps.json')
            // If successful, dispatch success action with result
            // .map(data => ({ type: AppActions.METADATA_LOAD_SUCCESS, payload: data }))
            // If request fails, dispatch failed action
            // .catch(() => of({ type: AppActions.METADATA_LOAD_FAILED }))
        });

    constructor(
        private http: Http,
        private actions$: Actions,
        private interopServiceFactory: InteropServiceFactory
    ) { }
}