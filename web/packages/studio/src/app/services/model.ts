import { ProvidedMethod } from '@plexus-interop/broker';
import { InteropClient } from './InteropClient';
import { TransportConnectionProvider } from './TransportConnectionProvider';
import { App as Application, ConsumedMethod } from '@plexus-interop/broker';
import { InteropRegistryService } from '@plexus-interop/broker';
import { TransportConnection } from "@plexus-interop/transport-common";
import { MethodDiscoveryResponse } from "@plexus-interop/client-api";

export interface ServicesSnapshot {
    interopRegistryService: InteropRegistryService,
    сonnectionProvider: TransportConnectionProvider,
    interopClient: InteropClient
}

export interface StudioState {
    loading: boolean,
    connected: boolean;
    metadataUrl: string;
    connectedApp: Application;
    consumedMethod: ConsumedMethodState,
    providedMethod: ProvidedMethodState,
    apps: Application[],
    services: ServicesSnapshot
}

export interface ConsumedMethodState {
    method: ConsumedMethod;
    discoveredMethods: MethodDiscoveryResponse;
}

export interface ProvidedMethodState {
    method: ProvidedMethod;
}

export interface PlexusConnectedActionParams {
    apps: Application[],
    interopRegistryService: InteropRegistryService,
    сonnectionProvider: TransportConnectionProvider
}

export interface AppConnectedActionParams {
    interopClient: InteropClient,
    application: Application
}

export interface Alert {
    message: string,
    type: AlertType
}

export enum AlertType {
    INFO, SUCCESS, USER_FAIL, ERROR
}

