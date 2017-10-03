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
import { TransportConnection } from "../../../src/transport/TransportConnection";
import { randomPayload } from "../../utils";
import { BufferedObserver } from "../../BufferedObserver";
import { LogObserver } from "../../LogObserver";
import { setupConnections, disconnect } from "../transport-mocks";
import { AnonymousSubscription } from "rxjs/Subscription";
import { DelegateChannelObserver } from "../../../src/common/DelegateChannelObserver";

describe("Framed Transport Connection: Client to Server communication", () => {

    it("Sends message from server to client", async () => {
        const { client, server } = await setupConnections();
        await sendReceiveAndVerify(server, client, randomPayload(3));
        await disconnect(client, server);
    });

    it("Can connect client and server", async () => {
        const { client, server } = await setupConnections();
        expect(client).toBeDefined();
        expect(server).toBeDefined();
        await disconnect(client, server);
    });

    it("Sends message from client to server", async () => {
        const { client, server } = await setupConnections();
        await sendReceiveAndVerify(client, server, randomPayload(10));
        await disconnect(client, server);
    });

    it("Can send big message", async () => {
        const { client, server } = await setupConnections();
        const payload = randomPayload(2 * 1024);
        await sendReceiveAndVerify(server, client, payload);
        await disconnect(client, server);
    });

    it("Can send concurrently two messages to separate channels", async () => {
        const { client, server } = await setupConnections();
        await Promise.all([
            sendReceiveAndVerify(server, client, randomPayload(64)),
            sendReceiveAndVerify(server, client, randomPayload(3))]);
        await disconnect(client, server);
    });


    it("Can send messages with different length in a row", async () => {
        const { client, server } = await setupConnections();
        await sendReceiveAndVerifyAll(client, server, [randomPayload(1), randomPayload(10), randomPayload(5)]);
        await disconnect(client, server);
    });
    
    it("Can continue to send messages even if remote channel requested close", async () => {
        
        const { client, server } = await setupConnections();
        const clientChannel = await client.createChannel();
        
        const payload = new ArrayBuffer(3);
        
        await new Promise<AnonymousSubscription>(
            (resolve, reject) => clientChannel.open(new DelegateChannelObserver(new LogObserver(undefined, clientChannel.uuid()), (s) => resolve(s))));

        // sever channel opened
        const serverChannel = await server.waitForChannel();
        const observer = new BufferedObserver<ArrayBuffer>();
        await new Promise<AnonymousSubscription>(
            (resolve, reject) => serverChannel.open(new DelegateChannelObserver(observer, (s) => resolve(s))));
        
        // server channel close requested
        const serverChClosed = serverChannel.close();        
        
        clientChannel.sendMessage(payload);
        const received = await observer.pullData();

        expect(new Uint8Array(payload)).toEqual(new Uint8Array(received));
        const clientChClosed = clientChannel.close();
        await clientChClosed;
        await serverChClosed;
        await disconnect(client, server);

    });

    async function sendReceiveAndVerify(
        clientConnection: TransportConnection,
        serverConnection: TransportConnection,
        payload: ArrayBuffer): Promise<void> {
        const clientChannel = await clientConnection.createChannel();
        new Promise<AnonymousSubscription>(
            (resolve, reject) => clientChannel.open(new DelegateChannelObserver(new LogObserver(undefined, clientChannel.uuid()), (s) => resolve(s))))
            .then(() => {
                clientChannel.sendMessage(payload);
            });
        const serverChannel = await serverConnection.waitForChannel();
        const observer = new BufferedObserver<ArrayBuffer>();
        serverChannel.open(new DelegateChannelObserver(observer, (s) => {}));
        const received = await observer.pullData();
        expect(new Uint8Array(payload)).toEqual(new Uint8Array(received));
        const clientChClosed = clientChannel.close();
        const serverChClosed = serverChannel.close();
        await clientChClosed;
        await serverChClosed;
    }

    async function sendReceiveAndVerifyAll(
        clientConnection: TransportConnection,
        serverConnection: TransportConnection,
        payloads: ArrayBuffer[]): Promise<void> {
        
        const clientChannel = await clientConnection.createChannel();
        new Promise<AnonymousSubscription>(
            (resolve, reject) => clientChannel.open(new DelegateChannelObserver(new LogObserver(undefined, clientChannel.uuid()), (s) => resolve(s))))
            .then(() => {
                payloads.forEach(payload => clientChannel.sendMessage(payload));
            });
        const serverChannel = await serverConnection.waitForChannel();
        
        const observer = new BufferedObserver<ArrayBuffer>();
        await new Promise((resolve, _) => serverChannel.open(new DelegateChannelObserver(observer, (s) => resolve())));
        
        for (let payload of payloads) {
            const received = await observer.pullData();
            expect(new Uint8Array(payload)).toEqual(new Uint8Array(received));
        }
        const clientChClosed = clientChannel.close();
        const serverChClosed = serverChannel.close();
        await clientChClosed;
        await serverChClosed;
    }

});