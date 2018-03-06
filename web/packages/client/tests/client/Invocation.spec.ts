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
import { GenericInvocation } from "../../src/client/generic/GenericInvocation";
import { InvocationState } from "../../src/client/generic/InvocationState";
import { clientProtocol as plexus } from "@plexus-interop/protocol";
import { InvocationMetaInfo } from "@plexus-interop/protocol";
import { UniqueId, DelegateChannelObserver } from "@plexus-interop/transport-common";
import { ClientProtocolHelper as modelHelper } from "@plexus-interop/protocol";
import { randomPayload } from "../utils";
import { AsyncHelper, Observer } from "@plexus-interop/common";
import { CancellationToken } from "@plexus-interop/common";
import { createInvocationInfo } from "./client-mocks";
import { BufferedChannel } from "./client-mocks";
import { DelegateInvocationObserver } from "../../src/index";
import { LogInvocationObserver } from "../LogInvocationObserver";
import { BufferedInvocationObserver } from "../BufferedInvocationObserver";
import { InvocationObserver } from "../../src/client";

describe("Invocation", () => {

    let mockChannel: BufferedChannel;
    let invocationInfo: InvocationMetaInfo;
    let invocation: GenericInvocation;
    let inMessagesObserver: BufferedInvocationObserver<ArrayBuffer>;

    beforeEach(() => {
        invocationInfo = createInvocationInfo();
        const token = new CancellationToken();
        mockChannel = new BufferedChannel(token);
        invocation = new GenericInvocation(mockChannel, token);
        inMessagesObserver = new BufferedInvocationObserver<ArrayBuffer>(token);
    });

    it("Should request invocation start and go to STARTED state only when confirmation received", async () => {

        await prepareRequestedInvocation(new LogInvocationObserver());

        expect(invocation.currentState()).toEqual(InvocationState.OPEN);

        await closeInvocation();

    });

    it("Should accept incoming invocation request and send confirmation", async () => {

        const invocationAccepted = new Promise((resolve, reject) => {
            invocation.acceptInvocation(new DelegateInvocationObserver(new LogInvocationObserver(),
                (s) => resolve(s),
                (e) => reject(e)));
        });

        addToInbox(modelHelper.invocationRequestedPayload({
            methodId: invocationInfo.methodId,
            serviceId: invocationInfo.serviceId
        }));

        await invocationAccepted;

        const message = modelHelper.decodeInvocationStarted(await pullData());

        expect(message).toBeDefined();
        await closeInvocation();

    });

    it("Should reject API calls if invocation is not started", (done) => {

        invocation.sendMessage(new ArrayBuffer(0)).catch(() => done());

    });

    it("Should send message as header with length and body to channel", async () => {

        await prepareRequestedInvocation(new LogInvocationObserver());

        const data = randomPayload(10);
        await invocation.sendMessage(data);

        const message = await pullInvocationMessage();
        const header = message.message as plexus.interop.protocol.IInvocationMessageHeader;

        expect(header).toBeDefined();
        expect(invocation.getSentMessagesCounter()).toEqual(1);

        const content = await pullSentData();
        expect(new Uint8Array(content)).toEqual(new Uint8Array(data));
        await closeInvocation();

    });

    it("Should receive confirmations and decrease counter", async () => {

        const invocationId = await prepareRequestedInvocation(new LogInvocationObserver());

        await invocation.sendMessage(randomPayload());
        await invocation.sendMessage(randomPayload());

        addToInbox(modelHelper.messageReceivedPayload({
            invocationId
        }));
        addToInbox(modelHelper.messageReceivedPayload({
            invocationId
        }));

        await AsyncHelper.waitFor(() => mockChannel.isInboxEmpty());

        expect(invocation.getSentMessagesCounter()).toEqual(0);

        await closeInvocation();

    });

    it("Should receive message and send confirmation back", async () => {

        await prepareRequestedInvocation(inMessagesObserver);

        const data = randomPayload();
        addToInbox(modelHelper.messageHeaderPayload({
            length: data.byteLength
        }));

        addToInbox(data);

        const received = await inMessagesObserver.pullData();

        expect(new Uint8Array(received)).toEqual(new Uint8Array(data));

        const confirmation = await pullInvocationMessage();

        const header = confirmation.confirmation as plexus.interop.protocol.InvocationMessageReceived;

        expect(header).toBeDefined();

        await closeInvocation();

    });

    it("Should send 'Send completion' message before closing channel", async () => {

        await prepareRequestedInvocation(new LogInvocationObserver());

        expect(invocation.currentState()).toEqual(InvocationState.OPEN);

        await closeInvocation();

        const message = await pullInvocationMessage();
        expect(message.sendCompletion).toBeDefined();

    });

    async function pullInvocationMessage(): Promise<plexus.interop.protocol.IInvocationMessageEnvelope> {
        const message = await mockChannel.out.blockingDequeue();
        return modelHelper.decodeInvocationEnvelop(message);
    }

    async function pullStartRequest(): Promise<plexus.interop.protocol.IInvocationStartRequest> {
        const message = await mockChannel.out.blockingDequeue();
        return modelHelper.decodeInvocationStartRequest(message);
    }

    async function pullData(): Promise<ArrayBuffer> {
        return mockChannel.out.blockingDequeue();
    }

    function pullSentData(): Promise<ArrayBuffer> {
        return mockChannel.out.blockingDequeue();
    }

    function addToInbox(data: ArrayBuffer): void {
        mockChannel.addToInbox(data);
    }

    async function closeInvocation(): Promise<void> {
        // tslint:disable-next-line:no-console
        console.log("Cancelling invocation");
        const closePromise = invocation.close();
        addToInbox(modelHelper.sendCompletionPayload({}));
        await closePromise;
    }

    async function prepareRequestedInvocation(observer: InvocationObserver<ArrayBuffer> = new LogInvocationObserver<ArrayBuffer>()): Promise<UniqueId> {

        const startedPromise = new Promise((resolve, reject) => {
            invocation.start(invocationInfo,
                new DelegateInvocationObserver(observer,
                    (s) => resolve(s),
                    (e) => reject(e)));
        });

        const startRequestedMessage = await pullStartRequest();

        expect(startRequestedMessage).toBeDefined();

        if (startRequestedMessage.consumedMethod && startRequestedMessage.consumedMethod.consumedService) {
            expect(startRequestedMessage.consumedMethod.methodId).toEqual(invocationInfo.methodId);
            expect(startRequestedMessage.consumedMethod.consumedService.serviceId).toEqual(invocationInfo.serviceId);
            expect(startRequestedMessage.consumedMethod.consumedService.serviceId).toEqual(invocationInfo.serviceId);
            expect(startRequestedMessage.consumedMethod.consumedService.serviceAlias).toEqual(invocationInfo.serviceAlias);
        }
        
        addToInbox(modelHelper.invocationStartingMessagePayload({}));
        addToInbox(modelHelper.invocationStartedMessagePayload({}));
        
        return startedPromise.then<UniqueId>(() => UniqueId.generateNew());
    }

});
