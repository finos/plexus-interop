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
import { BaseEchoTest } from "./BaseEchoTest";
import { ConnectionProvider } from "../common/ConnectionProvider";
import { ClientsSetup } from "../common/ClientsSetup";
import { BenchmarkResult } from "../common/BenchmarkResult";
import { UnaryServiceHandler } from "./UnaryServiceHandler";
import { MethodInvocationContext, MethodType } from "@plexus-interop/client";
import { ServerStreamingHandler } from "./ServerStreamingHandler";
import { CancellationToken } from "@plexus-interop/common";

export class EchoClientBenchmark extends BaseEchoTest {

    public constructor(
        private connectionProvider: ConnectionProvider,
        private clientsSetup: ClientsSetup = new ClientsSetup()) {
        super();
    }

    public async testUnaryMessagesSentWithinPeriod(bytesPerMessage: number, periodInMillis: number): Promise<BenchmarkResult> {
        const echoRequest = this.clientsSetup.createRequestOfBytes(bytesPerMessage);
        const handler = new UnaryServiceHandler(async (context: MethodInvocationContext, request) => request);
        const [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, handler);
        const start = Date.now();
        const finish = start + periodInMillis;
        let sentMessagesCount = 0;
        let lastReceived = 0;
        while (finish > lastReceived) {
            await client.getEchoServiceProxy().unary(echoRequest);
            lastReceived = Date.now();
            sentMessagesCount++;
        }
        await this.clientsSetup.disconnect(client, server);
        return {
            periodInMillis,
            methodType: MethodType.Unary,
            messagesSent: sentMessagesCount,
            bytesSent: sentMessagesCount * bytesPerMessage,
            millisPerMessage: (lastReceived - start) / sentMessagesCount
        };
    }

    public async testStreamingEventsSentWithinPeriod(bytesPerMessage: number, periodInMillis: number): Promise<BenchmarkResult> {
        const echoRequest = this.clientsSetup.createRequestOfBytes(bytesPerMessage);
        const cancellationToken = new CancellationToken();
        const handler = new ServerStreamingHandler(async (context, request, hostClient) => {
            console.log("Starting to send");
            function sentMessages() {
                if (!cancellationToken.isCancelled()) {
                    hostClient.next(echoRequest);
                    hostClient.next(echoRequest);
                    hostClient.next(echoRequest);
                    hostClient.next(echoRequest);
                    hostClient.next(echoRequest);
                    setTimeout(sentMessages, 0);
                } else {
                    console.log("Completed " + new Date().toISOString());      
                    hostClient.complete();   
                }
            };
            sentMessages();
        });        
        const [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, handler);
        return new Promise<BenchmarkResult>(async (resolve, reject) => {
            const start = Date.now();
            const finish = start + periodInMillis;
            let sentMessagesCount = 0;
            let lastReceived = 0;      
            client.getEchoServiceProxy().serverStreaming(echoRequest, {
                next: (response) => {
                    if (cancellationToken.isCancelled()) {
                        return;
                    }
                    sentMessagesCount++;
                    lastReceived = Date.now();
                    if (finish < lastReceived) { 
                        cancellationToken.cancel();
                    }
                },
                complete: async () => {
                    console.log("Client completed")
                    await this.clientsSetup.disconnect(client, server);
                    resolve({
                        periodInMillis,
                        methodType: MethodType.Unary,
                        messagesSent: sentMessagesCount,
                        bytesSent: sentMessagesCount * bytesPerMessage,
                        millisPerMessage: (lastReceived - start) / sentMessagesCount
                    });
                },
                error: (e) => {
                    reject(e);
                }
            });
        });
        
    }

}