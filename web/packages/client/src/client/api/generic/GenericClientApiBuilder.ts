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
import { GenericClientApi } from './GenericClientApi';
import { TransportConnection, UniqueId } from '@plexus-interop/transport-common';
import { GenericClientFactory } from '../../generic/GenericClientFactory';
import { ClientConnectRequest } from '@plexus-interop/client-api';
import { GenericClientApiImpl } from './GenericClientApiImpl';
import { GenericInvocationsHost } from './GenericInvocationsHost';
import { Logger, LoggerFactory, retriable, defaultPromiseRetryConfig } from '@plexus-interop/common';
import { InvocationHandlersRegistry } from './handlers/InvocationHandlersRegistry';
import { BidiStreamingInvocationHandler } from './handlers/streaming/BidiStreamingInvocationHandler';
import { ServerStreamingInvocationHandler } from './handlers/streaming/ServerStreamingInvocationHandler';
import { UnaryInvocationHandler } from './handlers/unary/UnaryInvocationHandler';
import { InternalGenericClientApi } from './internal/InternalGenericClientApi';
import { BinaryMarshallerProvider } from '@plexus-interop/io';
import { ProtoMarshallerProvider } from '@plexus-interop/io/dist/main/src/static';


// tslint:disable:member-ordering
export class GenericClientApiBuilder {

    protected log: Logger = LoggerFactory.getLogger('GenericClientApiBuilder');

    protected applicationId: string;
    protected applicationInstanceId?: UniqueId;
    protected handlersRegistry: InvocationHandlersRegistry;
    protected transportConnectionProvider: () => Promise<TransportConnection>;
    protected clientApiDecorator: (client: InternalGenericClientApi) => Promise<GenericClientApi> = async client => client;

    constructor(protected marshallerProvider: BinaryMarshallerProvider = new ProtoMarshallerProvider()) {
        this.handlersRegistry = new InvocationHandlersRegistry(this.marshallerProvider);
    }

    public withClientApiDecorator(clientApiDecorator: (client: InternalGenericClientApi) => Promise<GenericClientApi>): GenericClientApiBuilder {
        this.clientApiDecorator = clientApiDecorator;
        return this;
    }

    public withApplicationId(appId: string): GenericClientApiBuilder {
        this.applicationId = appId;
        return this;
    }

    public withAppInstanceId(instanceId: UniqueId): GenericClientApiBuilder {
        this.applicationInstanceId = instanceId;
        return this;
    }

    public withClientDetails(clientId: ClientConnectRequest): GenericClientApiBuilder {
        this.applicationId = clientId.applicationId;
        this.applicationInstanceId = clientId.applicationInstanceId;
        return this;
    }

    public withBidiStreamingHandler(handler: BidiStreamingInvocationHandler<ArrayBuffer, ArrayBuffer>): GenericClientApiBuilder {
        this.handlersRegistry.registerBidiStreamingGenericHandler(handler);
        return this;
    }

    public withTypeAwareBidiStreamingHandler(handler: BidiStreamingInvocationHandler<ArrayBuffer, ArrayBuffer>, requestType: any, responseType: any): GenericClientApiBuilder {
        this.handlersRegistry.registerBidiStreamingHandler(handler, requestType, responseType);
        return this;
    }

    public withServerStreamingHandler(handler: ServerStreamingInvocationHandler<ArrayBuffer, ArrayBuffer>): GenericClientApiBuilder {
        this.handlersRegistry.registerServerStreamingGenericHandler(handler);
        return this;
    }

    public withTypeAwareServerStreamingHandler(handler: ServerStreamingInvocationHandler<any, any>, requestType: any, responseType: any): GenericClientApiBuilder {
        this.handlersRegistry.registerServerStreamingHandler(handler, requestType, responseType);
        return this;
    }

    public withUnaryHandler(handler: UnaryInvocationHandler<ArrayBuffer, ArrayBuffer>): GenericClientApiBuilder {
        this.handlersRegistry.registerUnaryGenericHandler(handler);
        return this;
    }

    public withTypeAwareUnaryHandler(handler: UnaryInvocationHandler<any, any>, requestType: any, responseType: any): GenericClientApiBuilder {
        this.handlersRegistry.registerUnaryHandler(handler, requestType, responseType);
        return this;
    }

    public withTransportConnectionProvider(provider: () => Promise<TransportConnection>): GenericClientApiBuilder {
        this.transportConnectionProvider = provider;
        return this;
    }

    public connect(): Promise<GenericClientApi> {
        if (!this.applicationInstanceId) {
            this.applicationInstanceId = UniqueId.generateNew();
        }
        const appInfo = {
            applicationId: this.applicationId,
            applicationInstanceId: this.applicationInstanceId
        };
        const connectionRetryConfig = {
            ...defaultPromiseRetryConfig,
            errorHandler: (connectError: any) => {
                this.log.warn(`Failed to get connection, will retry in ${defaultPromiseRetryConfig.retryTimeoutInMillis}ms`, connectError);
            }
        };
        const connectionProviderWithRetries = retriable(() => this.transportConnectionProvider(), connectionRetryConfig);
        return this.validateState()
            .then(connectionProviderWithRetries)
            .then(connection => {
                this.log.info('Connection established');
                return new GenericClientFactory(connection).createClient(appInfo);
            })
            .then(genericClient => {
                const actionsHost = new GenericInvocationsHost(genericClient, this.handlersRegistry);
                return actionsHost.start()
                    .then(() => new GenericClientApiImpl(genericClient, this.marshallerProvider, this.handlersRegistry))
                    .then(client => this.clientApiDecorator(client));
            })
            .catch(error => {
                this.log.error('Unable to create client', error);
                throw error;
            });
    }

    private async validateState(): Promise<void> {
        if (!this.marshallerProvider) {
            throw 'Marshaller Provider is not defined';
        }
        if (!this.transportConnectionProvider) {
            throw 'Transport Connection Provider is not defined';
        }
        if (!this.applicationId || !this.applicationInstanceId) {
            throw 'Application ID is not defined';
        }
    }

}