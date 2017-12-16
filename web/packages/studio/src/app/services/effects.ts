import { State } from './reducers';
import { TransportConnectionFactory } from './TransportConnectionFactory';
import { Application } from '@plexus-interop/broker/dist/main/src/metadata/apps/model/Application';
import { PlexusConnectedActionParams, ServicesSnapshot, StudioState, Alert } from './model';
import { InteropClientFactory } from './InteropClientFactory';
import { TypedAction } from './TypedAction';
import { AppRegistryService } from '@plexus-interop/broker';
import { InteropServiceFactory } from './InteropServiceFactory';
import { AppActions } from './app.actions';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/combineLatest';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import * as fromAlerts from './reducers/alerts';
import { Router } from '@angular/router';

@Injectable()
export class Effects {
    @Effect() connectToPlexus$: Observable<TypedAction<PlexusConnectedActionParams>> = this
        .actions$
        .ofType<TypedAction<string>>(AppActions.METADATA_LOAD_START)
        .mergeMap(async action => {
            const baseUrl = action.payload;
            const interopRegistryService = await this.interopServiceFactory.getInteropRegistryService(baseUrl);
            const appRegistryService = await this.interopServiceFactory.getAppRegistryService(baseUrl);
            const apps = appRegistryService.getApplications();

            const сonnectionProvider = await this.transportConnectionFactory.createWebTransportProvider(baseUrl);

            return {
                type: AppActions.METADATA_LOAD_SUCCESS,
                payload: {
                    apps,
                    interopRegistryService,
                    сonnectionProvider
                }
            };
        });

    @Effect() plexusConnected$: Observable<Action> = this
        .actions$
        .ofType(AppActions.METADATA_LOAD_SUCCESS)
        .map(_ => {
            this.router.navigate(['/apps']);

            return { type: AppActions.DO_NOTHING };
        });

    @Effect() connectToApp$: Observable<TypedAction<any>> = this
        .actions$
        .ofType<TypedAction<Application>>(AppActions.CONNECT_TO_APP_START)
        .combineLatest(this.store.select(state => state.plexus.services))
        .mergeMap(async ([action, services]) => {
            const application = action.payload;
            const appId = application.id;
            const interopClient = await this.interopClientFactory.connect(appId, services.interopRegistryService, services.сonnectionProvider);

            return {
                type: AppActions.CONNECT_TO_APP_SUCCESS,
                payload: { interopClient }
            };
        });

    @Effect() appConnected$: Observable<Action> = this
        .actions$
        .ofType(AppActions.CONNECT_TO_APP_SUCCESS)
        .map(_ => {
            this.router.navigate(['/app']);

            return { type: AppActions.DO_NOTHING };
        });

   @Effect() appConnectionFailed$: Observable<Action> = this
        .actions$
        .ofType(AppActions.CONNECT_TO_APP_FAILED)
        .map(_ => {
            this.router.navigate(['/app']);

            return { type: AppActions.DO_NOTHING };
        });

    constructor(
        private http: Http,
        private actions$: Actions,
        private interopServiceFactory: InteropServiceFactory,
        private interopClientFactory: InteropClientFactory,
        private store: Store<State>,
        private transportConnectionFactory: TransportConnectionFactory,
        private router: Router
    ) { }
}