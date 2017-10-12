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
import { GenericClient } from "./GenericClient";
import { Invocation } from "../../client/generic/Invocation";
import { GenericInvocation } from "./GenericInvocation";
import { TransportChannel, TransportConnection } from "@plexus-interop/transport-common";
import { InvocationRequestInfo } from "./InvocationMetaInfo";
import { AnonymousSubscription, Subscription } from "rxjs/Subscription";
import { RequestedInvocation } from "./RequestedInvocation";
import { StateMaschine, StateMaschineBase, CancellationToken, Logger, LoggerFactory } from "@plexus-interop/common";
import { AcceptedInvocation } from "./AcceptedInvocation";
import { Observer } from "@plexus-interop/common";
import { ServiceDiscoveryRequest } from "../api/dto/ServiceDiscoveryRequest";
import { ServiceDiscoveryResponse } from "../api/dto/ServiceDiscoveryResponse";
import { SingleMessageRequest } from "./SingleMessageRequst";
import { ClientProtocolHelper as modelHelper } from "./ClientProtocolHelper";
import { clientProtocol as plexus, SuccessCompletion } from "@plexus-interop/protocol";
import { MethodDiscoveryRequest } from "../api/dto/MethodDiscoveryRequest";
import { MethodDiscoveryResponse } from "../api/dto/MethodDiscoveryResponse";
import { ProvidedMethodReference } from "../api/dto/ProvidedMethodReference";
import { RequestedDiscoveredInvocation } from "./RequestedDiscoveredInvocation";

enum ClientState { CREATED, LISTEN, CLOSED };

export class GenericClientImpl implements GenericClient {

    private readonly state: StateMaschine<ClientState>;
    private log: Logger;
    private cancellationToken: CancellationToken = new CancellationToken();

    constructor(private readonly transportConnection: TransportConnection) {
        this.log = LoggerFactory.getLogger("GenericClient");
        this.state = new StateMaschineBase(ClientState.CREATED, [
            {
                from: ClientState.CREATED, to: ClientState.LISTEN
            },
            {
                from: ClientState.CREATED, to: ClientState.CLOSED, preHandler: async () => this.cancellationToken.cancel("Closed")
            },
            {
                from: ClientState.LISTEN, to: ClientState.CLOSED, preHandler: async () => this.cancellationToken.cancel("Closed")
            }
        ]);
        this.log.trace("Created");
    }

    public async requestInvocation(invocationInfo: InvocationRequestInfo): Promise<Invocation> {
        this.log.debug("Invocation requested");
        const channel: TransportChannel = await this.transportConnection.createChannel();
        return new RequestedInvocation(new GenericInvocation(channel), invocationInfo);
    }

    public async requestDiscoveredInvocation(methodReference: ProvidedMethodReference): Promise<Invocation> {
        this.log.debug("Discovered Invocation requested");
        const channel: TransportChannel = await this.transportConnection.createChannel();
        return new RequestedDiscoveredInvocation(new GenericInvocation(channel), methodReference);
    }

    public async acceptInvocations(observer: Observer<Invocation>): Promise<AnonymousSubscription> {
        this.log.debug("Accept invocation requested");
        this.state.throwIfNot(ClientState.CREATED);
        const channelsObserver: Observer<TransportChannel> = {
            next: (channel: TransportChannel) => {
                observer.next(new AcceptedInvocation(new GenericInvocation(channel)));
            },
            error: (e) => observer.error(e),
            complete: () => observer.complete()
        };
        this.state.go(ClientState.LISTEN, {
            postHandler: () => this.startIncomingChannelsListener(channelsObserver)
        });
        return new Subscription(() => {
            this.log.debug("Unsubscribe received");
            if (this.state.is(ClientState.LISTEN)) {
                this.state.go(ClientState.CLOSED);
            }
        });
    }

    public discoverService(discoveryRequest: ServiceDiscoveryRequest): Promise<ServiceDiscoveryResponse> {
        const requestPayload = modelHelper.discoveryServiceRequestPayload(discoveryRequest);
        return new SingleMessageRequest<plexus.interop.protocol.IServiceDiscoveryResponse>(this.transportConnection, this.log)
            .execute(requestPayload, (responsePayload) => modelHelper.decodeServiceDiscoveryResponse(responsePayload))
            .then(response => {
                this.log.debug(`Discovery Service response received`);
                return response;
            });
    }

    public discoverMethod(discoveryRequest: MethodDiscoveryRequest): Promise<MethodDiscoveryResponse> {
        const requestPayload = modelHelper.discoveryMethodRequestPayload(discoveryRequest);
        return new SingleMessageRequest<plexus.interop.protocol.IMethodDiscoveryRequest>(this.transportConnection, this.log)
            .execute(requestPayload, (responsePayload) => modelHelper.decodeMethodDiscoveryResponse(responsePayload))
            .then(response => {
                this.log.debug(`Discovery Method response received`);
                return response;
            });
    }

    public disconnect(completion: plexus.ICompletion = new SuccessCompletion()): Promise<void> {
        return this.transportConnection.disconnect(completion);
    }

    private async startIncomingChannelsListener(observer: Observer<TransportChannel>): Promise<void> {
        this.log.debug("Started to listen for channels");
        while (this.state.is(ClientState.LISTEN)) {
            try {
                const channel: TransportChannel = await this.transportConnection.waitForChannel(this.cancellationToken);
                this.log.debug("Channel received");
                observer.next(channel);
            } catch (error) {
                this.log.error("Error while reading frame", error);
                await this.state.go(ClientState.CLOSED);
            }
        }
        this.log.debug("Finished to listen for Channels");
        observer.complete();
    }

}