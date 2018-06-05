/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
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
import { LoggerFactory } from '@plexus-interop/common';
import { logger, State } from './RootReducers';
import { TransportConnectionFactory } from '../core/TransportConnectionFactory';
import { Application, ConsumedMethod } from '@plexus-interop/broker';
import {
    Alert,
    AppConnectedActionParams,
    ConnectionSetupActionParams,
    PlexusConnectedActionParams,
    ServicesSnapshot,
    StudioState,
} from './AppModel';
import { TypedAction } from '../reducers/TypedAction';
import { InteropClientFactory } from '../core/InteropClientFactory';
import { AppRegistryService } from '@plexus-interop/broker';
import { InteropServiceFactory } from '../core/InteropServiceFactory';
import { AppActions } from './AppActions';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/withLatestFrom';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Router } from '@angular/router';
import { DiscoveryMode } from '@plexus-interop/client-api';
import { UrlParamsProvider } from '@plexus-interop/common';
import { TransportType } from '../ui/AppModel';
import { StudioExtensions } from '../extensions/StudioExtensions';
import { autoConnectEffect, connectionSetupEffect } from '../effects/ConnectionEffects';

@Injectable()
export class Effects {

    private log = LoggerFactory.getLogger(Effects.name);

    @Effect() autoConnectToPlexus$: Observable<Action> = this
        .actions$
        .ofType(AppActions.AUTO_CONNECT)
        .withLatestFrom(this.store.select(state => state.plexus))
        .mergeMap(async ([action, state]) => autoConnectEffect(state));

    @Effect() connectToPlexus$: Observable<Action> = this
        .actions$
        .ofType<TypedAction<ConnectionSetupActionParams>>(AppActions.CONNECTION_SETUP_START)
        .mergeMap(async action => connectionSetupEffect(action.payload, this.transportConnectionFactory, this.interopServiceFactory));

    @Effect() plexusConnected$: Observable<Action> = this
        .actions$
        .ofType(AppActions.CONNECTION_SETUP_SUCCESS)
        .map(_ => {
            this.router.navigate(['/apps'], { queryParamsHandling: 'merge' });
            return { type: AppActions.DO_NOTHING };
        });

    @Effect() disconnectMetadata = this.actions$
        .ofType(AppActions.DISCONNECT_FROM_PLEXUS)
        .withLatestFrom(this.store.select(state => state.plexus.services).filter(services => !!services))
        .mergeMap(async ([action, services]) => {

            if (services.interopClient) {
                await services.interopClient.disconnect();
            }

            this.log.info(`Disconnect from metadata - success!`);

            this.router.navigate(['/']);

            return { type: AppActions.DISCONNECT_FROM_PLEXUS_SUCCESS };
        });

    @Effect() connectToApp$: Observable<TypedAction<AppConnectedActionParams>> = this
        .actions$
        .ofType<TypedAction<Application>>(AppActions.CONNECT_TO_APP_START)
        .withLatestFrom(this.store.select(state => state.plexus.services).filter(services => !!services))
        .mergeMap(async ([action, services]) => {

            const application = action.payload;
            const appId = application.id;

            const interopClient = await this.interopClientFactory.connect(appId, services.interopRegistryService, services.сonnectionProvider);

            return {
                type: AppActions.CONNECT_TO_APP_SUCCESS,
                payload: { interopClient, application }
            };
        });

    @Effect() loadConsumedMethod$: Observable<TypedAction<any>> =
        this.actions$
            .ofType<TypedAction<ConsumedMethod>>(AppActions.SELECT_CONSUMED_METHOD)
            .withLatestFrom(this.store.select(state => state.plexus.services).filter(services => !!services))
            .mergeMap(async ([action, services]) => {
                const method = action.payload;
                const interopClient = services.interopClient;
                const discoveredMethods = await interopClient.discoverAllMethods(method);
                return {
                    type: AppActions.CONSUMED_METHOD_SUCCESS,
                    payload: {
                        method,
                        discoveredMethods
                    }
                };
            });

    @Effect() appConnected$: Observable<Action> = this
        .actions$
        .ofType(AppActions.CONNECT_TO_APP_SUCCESS)
        .map(_ => {
            return { type: AppActions.NAVIGATE_TO_APP };
        });

    @Effect() consumedActionLoaded$: Observable<Action> = this
        .actions$
        .ofType(AppActions.CONSUMED_METHOD_SUCCESS)
        .map(_ => {
            this.router.navigate(['/consumed'], { queryParamsHandling: 'merge' });
            return { type: AppActions.DO_NOTHING };
        });

    @Effect() appConnectionFailed$: Observable<Action> = this
        .actions$
        .ofType(AppActions.CONNECT_TO_APP_FAILED)
        .map(_ => {
            this.router.navigate(['/apps']);
            return { type: AppActions.DO_NOTHING };
        });

    @Effect() navigateToApp$: Observable<Action> = this
        .actions$
        .ofType(AppActions.NAVIGATE_TO_APP)
        .withLatestFrom(this.store.select(state => state.plexus.services))
        .mergeMap(async ([action, services]) => {
            services.interopClient.resetInvocationHandlers();
            this.router.navigate(['/app'], { queryParamsHandling: 'merge' });
            return { type: AppActions.DO_NOTHING };
        });

    @Effect() disconnectFromApp$: Observable<Action> = this
        .actions$
        .ofType(AppActions.DISCONNECT_FROM_APP)
        .withLatestFrom(this.store.select(state => state.plexus.services))
        .mergeMap(async ([action, services]) => {
            const disconnected = await services.interopClient.disconnect();
            return { type: AppActions.DISCONNECT_FROM_APP_SUCCESS };
        });

    @Effect() disconnectedFromApp$: Observable<Action> = this
        .actions$
        .ofType(AppActions.DISCONNECT_FROM_APP_SUCCESS)
        .withLatestFrom(this.store.select(state => state.plexus.services))
        .map(_ => {
            this.log.info(`Disconnected from app - success!`);
            this.router.navigate(['/apps']);

            return { type: AppActions.DO_NOTHING };
        });

    constructor(
        private http: Http,
        private actions$: Actions,
        private transportConnectionFactory: TransportConnectionFactory,
        private interopServiceFactory: InteropServiceFactory,
        private interopClientFactory: InteropClientFactory,
        private store: Store<State>,
        private router: Router
    ) { }
}