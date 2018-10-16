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
import { GenericClientApi, MethodType } from '@plexus-interop/client';
import { ConnectionStatusListeners } from './listeners';
import { InteropRegistryService, Application } from '@plexus-interop/metadata';
import { InvokeHandler } from './actions/InvokeHandler';
import { SubscribeHandler } from './actions/SubscribeHandler';
import { DiscoverMethodsHandler } from './actions/DiscoverMethodsHandler';

export class PlexusInteropPeer implements InteropPeer {

    private statusChangedListeners: ConnectionStatusListeners = new ConnectionStatusListeners();

    public connectionStatus: ConnectionStatus;
    public isConnected: boolean;
    public applicationName: string;
    public id: string;

    public constructor(
        private readonly genericClientApi: GenericClientApi,
        private readonly registryService: InteropRegistryService,
        private readonly plexusAppMetadata: Application
    ) {
        this.id = this.genericClientApi.getConnectionId().toString();
        this.isConnected = true;
    }

    public onConnectionStatusChanged(callback: (status: ConnectionStatus) => void): Subscription {
        return this.statusChangedListeners.addListener(callback);
    }

    public async disconnect(): Promise<void> {
        await this.genericClientApi.disconnect();
        this.statusChangedListeners.notifyListeners(ConnectionStatus.Disconnected);
    }

    public invoke(method: string | Method, args?: any): Promise<InvokeResult> {
        return new InvokeHandler(this.registryService, this.genericClientApi, this.plexusAppMetadata).handle(method, args);
    }

    public subscribe(stream: string | Method, observer: StreamObserver, args?: any): Promise<StreamSubscription> {
        return new SubscribeHandler(this.registryService, this.genericClientApi, this.plexusAppMetadata).handle(stream, observer, args);
    }

    public discoverMethods(): Promise<Method[]> {
        return new DiscoverMethodsHandler(this.genericClientApi, this.registryService)
            .discoverMethods(MethodType.Unary);
    }

    public discoverStreams(): Promise<Method[]> {
        return new DiscoverMethodsHandler(this.genericClientApi, this.registryService)
            .discoverMethods(MethodType.ServerStreaming);
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

    public discoverPeers(): Promise<InteropPeerDescriptor[]> {
        throw new Error('Method not implemented.');
    }

    public onPeerDisconnected(callback: (peer: InteropPeerDescriptor) => void): Subscription {
        throw new Error('Method not implemented.');
    }

    // <= TODO: Not Implemented
}