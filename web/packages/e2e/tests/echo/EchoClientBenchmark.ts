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

export class EchoClientBenchmark extends BaseEchoTest {

    public constructor(
        private connectionProvider: ConnectionProvider,
        private clientsSetup: ClientsSetup = new ClientsSetup()) {
        super();
    }

    public async testUnaryMessagesSentWithinPeriod(numberOfMessages: number, bytesPerMessage: number, periodInMillis: number): Promise<BenchmarkResult> {
        const echoRequest = this.clientsSetup.createRequestOfBytes(bytesPerMessage);
        const handler = new UnaryServiceHandler(async (context: MethodInvocationContext, request) => request);
        const [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, handler);
        const finish = Date.now() + periodInMillis;
        let sentMessagesCount = 0;
        while (finish > Date.now()) {
            const start = Date.now();
            const result = await client.getEchoServiceProxy().unary(echoRequest);
            sentMessagesCount++;
        }
        await this.clientsSetup.disconnect(client, server);
        return {
            methodType: MethodType.Unary,
            messagesSent: sentMessagesCount,
            periodInMillis: periodInMillis,
            bytesSent: sentMessagesCount * bytesPerMessage
        }
    }

}