/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { GenericClientApi } from "./GenericClientApi";
import { TransportConnection } from "@plexus-interop/transport-common";
import { GenericClientFactory } from "../../generic/GenericClientFactory";
import { ClientConnectRequest } from "@plexus-interop/client-api";
import { GenericClientApiImpl } from "./GenericClientApiImpl";
import { GenericInvocationsHost } from "./GenericInvocationsHost";
import { GenericUnaryInvocationHandler } from "./GenericUnaryInvocationHandler";
import { GenericBidiStreamingInvocationHandler } from "./GenericBidiStreamingInvocationHandler";
import { GenericServerStreamingInvocationHandler } from "./GenericServerStreamingInvocationHandler";
import { MarshallerProvider } from "../io/MarshallerProvider";
import { ProtoMarshallerProvider } from "../io/ProtoMarshallerProvider";
import { Logger, LoggerFactory} from "@plexus-interop/common";

export class GenericClientApiBuilder {

    private log: Logger = LoggerFactory.getLogger("GenericClientApiBuilder");

    private applicationInfo: ClientConnectRequest;
    
    private transportConnectionProvider: () => Promise<TransportConnection>;
    private marshallerProvider: MarshallerProvider = new ProtoMarshallerProvider();

    private readonly bidiStreamingInvocationHandlers: GenericBidiStreamingInvocationHandler[] = [];
    private readonly unaryInvocationHandlers: GenericUnaryInvocationHandler[] = [];
    private readonly serverStreamingInvocationHandlers: GenericServerStreamingInvocationHandler[] = [];

    public withMarshallerProvider(marshallerProvider: MarshallerProvider): GenericClientApiBuilder {
        this.marshallerProvider = marshallerProvider;
        return this;
    }

    public withClientDetails(clientId: ClientConnectRequest): GenericClientApiBuilder {
        this.applicationInfo = clientId;
        return this;
    }

    public withBidiStreamingInvocationHandler(handler: GenericBidiStreamingInvocationHandler): GenericClientApiBuilder {
        this.bidiStreamingInvocationHandlers.push(handler);
        return this;
    }

    public withServerStreamingInvocationHandler(handler: GenericServerStreamingInvocationHandler): GenericClientApiBuilder {
        this.serverStreamingInvocationHandlers.push(handler);
        return this;
    }

    public withUnaryInvocationHandler(handler: GenericUnaryInvocationHandler): GenericClientApiBuilder {
        this.unaryInvocationHandlers.push(handler);
        return this;
    }

    public withTransportConnectionProvider(provider: () => Promise<TransportConnection>): GenericClientApiBuilder {
        this.transportConnectionProvider = provider;
        return this;
    }

    private async validateState(): Promise<void> {
        if (!this.marshallerProvider) {
            throw "Marshaller Provider is not defined";
        }
        if (!this.transportConnectionProvider) {
            throw "Transport Connection Provider is not defined";
        }
        if (!this.applicationInfo || !this.applicationInfo.applicationId) {
            throw "Application ID is not defined";
        }
    }

    public connect(): Promise<GenericClientApi> {
        return this.validateState() 
            .then(() => this.transportConnectionProvider())
            .then(connection => {
                this.log.info("Connection established");
                return new GenericClientFactory(connection).createClient(this.applicationInfo);
            })
            .then(genericClient => {
                const actionsHost = new GenericInvocationsHost(this.applicationInfo.applicationId, genericClient, 
                    this.bidiStreamingInvocationHandlers,
                    this.unaryInvocationHandlers,
                    this.serverStreamingInvocationHandlers);
                return actionsHost.start().then(() => new GenericClientApiImpl(genericClient, this.marshallerProvider));
            })
            .catch(error => {
                this.log.error("Unable to create client", error);
                throw error;
            });
    }

}