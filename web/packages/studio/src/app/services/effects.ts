import { LoggerFactory } from '@plexus-interop/common';
import { logger, State } from './reducers';
import { TransportConnectionFactory } from './TransportConnectionFactory';
import { App as Application, ConsumedMethod } from "@plexus-interop/broker";
import {
    Alert,
    AppConnectedActionParams,
    MetadataLoadActionParams,
    PlexusConnectedActionParams,
    ServicesSnapshot,
    StudioState,
} from './model';
import { InteropClientFactory } from './InteropClientFactory';
import { TypedAction } from './TypedAction';
import { AppRegistryService } from '@plexus-interop/broker';
import { InteropServiceFactory } from './InteropServiceFactory';
import { AppActions } from './app.actions';
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

@Injectable()
export class Effects {
    private plexusLogger = LoggerFactory.getLogger(Effects.name);

    @Effect() autoConnectToPlexus$: Observable<Action> = this
        .actions$
        .ofType(AppActions.AUTO_CONNECT)
        .withLatestFrom(this.store.select(state => state.plexus))
        .mergeMap(async ([action, state]) => {
            const payload: MetadataLoadActionParams = {
                baseUrl: state.metadataUrl,
                silentOnFailure: true
            };

            return {
                type: AppActions.METADATA_LOAD_START,
                payload: payload
            };
        });

    @Effect() connectToPlexus$: Observable<Action> = this
        .actions$
        .ofType<TypedAction<MetadataLoadActionParams>>(AppActions.METADATA_LOAD_START)
        .mergeMap(async action => {
            const params = action.payload;
            const baseUrl = params.baseUrl;

            try {
                const interopRegistryService = await this.interopServiceFactory.getInteropRegistryService(baseUrl);
                const appRegistryService = await this.interopServiceFactory.getAppRegistryService(baseUrl);
                const apps = appRegistryService.getApplications();

                const сonnectionProvider = await this.transportConnectionFactory.createWebTransportProvider(baseUrl);
                this.plexusLogger.info(`Connect to ${baseUrl} metadata folder successful!`);

                return {
                    type: AppActions.METADATA_LOAD_SUCCESS,
                    payload: {
                        apps,
                        interopRegistryService,
                        сonnectionProvider
                    }
                };
            }
            catch (error) {
                const msg = `Connection not successful. Please enter correct metadata base url..`;

                if (params.silentOnFailure) {
                    this.plexusLogger.info(msg);
                } else {
                    this.plexusLogger.error(msg);

                    return {
                        type: AppActions.DISCONNECT_FROM_PLEXUS
                    };
                };
            }
        });

    @Effect() disconnectMetadata = this.actions$
        .ofType(AppActions.DISCONNECT_FROM_PLEXUS)
        .withLatestFrom(this.store.select(state => state.plexus.services).filter(services => !!services))
        .mergeMap(async ([action, services]) => {
            const connection = await services.сonnectionProvider();
            await connection.disconnect();

            this.plexusLogger.info(`Disconnect from metadata - success!`);

            this.router.navigate(['/']);

            return { type: AppActions.DISCONNECT_FROM_PLEXUS_SUCCESS };
        });

    @Effect() plexusConnected$: Observable<Action> = this
        .actions$
        .ofType(AppActions.METADATA_LOAD_SUCCESS)
        .map(_ => {
            this.router.navigate(['/apps'], { queryParamsHandling: 'merge' });

            return { type: AppActions.DO_NOTHING };
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

            const discoveredMethods = await interopClient.discoverMethod({
                consumedMethod: {
                    consumedService: {
                        serviceId: method.consumedService.service.id
                    },
                    methodId: method.method.name
                }
            });

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
            this.router.navigate(['/app'], { queryParamsHandling: 'merge' });

            return { type: AppActions.DO_NOTHING };
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
            this.plexusLogger.info(`Disconnected from app - success!`);
            this.router.navigate(['/apps']);

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