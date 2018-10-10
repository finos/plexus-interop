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
import { InteropPeer, ConnectionStatus, Subscription, Method, InvokeResult, StreamObserver, StreamSubscription, InteropPeerDescriptor, MethodImplementation, RegisteredMethod, StreamImplementation } from './api/client-api';
import { GenericClientApi, DiscoveryMode, GenericRequest } from '@plexus-interop/client';
import { ConnectionStatusListeners } from './listeners';
import { InteropRegistryService, InteropRegistry, ProvidedMethod, Application } from '@plexus-interop/metadata';
import { isMethod } from './types';
import { getProvidedMethodByAlias, toConsumedMethodRef } from './metadata';
import { UniqueId } from '@plexus-interop/protocol';
import { InvokeAction } from './actions/InvokeAction';

export class PlexusInteropPeer implements InteropPeer {

    private statusChangedListeners: ConnectionStatusListeners = new ConnectionStatusListeners();
    private plexusAppMetadata: Application;

    public connectionStatus: ConnectionStatus;
    public isConnected: boolean;
    public applicationName: string;
    public id: string;

    public constructor(
        private readonly genericClientApi: GenericClientApi,
        private readonly registryService: InteropRegistryService,
        applicatioName: string
    ) {
        this.id = this.genericClientApi.getConnectionId().toString();
        this.isConnected = true;
        this.applicationName = applicatioName;
        this.plexusAppMetadata = this.registryService.getApplication(this.applicationName);
    }

    public onConnectionStatusChanged(callback: (status: ConnectionStatus) => void): Subscription {
        return this.statusChangedListeners.addListener(callback);
    }

    public async disconnect(): Promise<void> {
        return this.genericClientApi.disconnect();
    }

    public invoke(method: string | Method, args?: any): Promise<InvokeResult> {
       return new InvokeAction(this.registryService, this.genericClientApi, this.plexusAppMetadata).handle(method, args);
    }

    public subscribe(stream: string | Method, observer: StreamObserver, args?: any): Promise<StreamSubscription> {
        throw new Error('Method not implemented.');
    }

    public discoverPeers(): Promise<InteropPeerDescriptor[]> {
        throw new Error('Method not implemented.');
    }

    public discoverMethods(): Promise<Method[]> {
        throw new Error('Method not implemented.');
    }

    public discoverStreams(): Promise<Method[]> {
        throw new Error('Method not implemented.');
    }
    
    public onPeerDisconnected(callback: (peer: InteropPeerDescriptor) => void): Subscription {
        throw new Error('Method not implemented.');
    }

    // TODO: Not Implemented =>

    public onMethodRegistered(callback: (method: Method) => void): Subscription {
        throw new Error('Method not implemented.');
    }

    public onMethodUnregistered(callback: (method: Method) => void): Subscription {
        throw new Error('Method not implemented.');
    }

    public onStreamRegistered(callback: (stream: Method) => void): Subscription {
        throw new Error('Method not implemented.');
    }

    public onStreamUnregistered(callback: (stream: Method) => void): Subscription {
        throw new Error('Method not implemented.');
    }

    public onPeerConnected(callback: (peer: InteropPeerDescriptor) => void): Subscription {
        throw new Error('Method not implemented.');
    }

    public register(methodImplementation: MethodImplementation): Promise<RegisteredMethod> {
        throw new Error('Method not implemented.');
    }

    public registerStream(streamImplementation: StreamImplementation): Promise<RegisteredMethod> {
        throw new Error('Method not implemented.');
    }

    public publishApiMetadata(apiMetadata: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public getApiMetadata(): Promise<string> {
        throw new Error('Method not implemented.');
    }

    public onApiMetadataChanged(callback: (metadata: string) => void): void {
        throw new Error('Method not implemented.');
    }

    public onDisconnected(callback: (error?: Error) => void): Subscription {
        throw new Error('Method not implemented.');
    }

    // <= TODO: Not Implemented
}