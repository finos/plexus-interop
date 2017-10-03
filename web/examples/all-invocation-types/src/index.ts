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
import { ComponentAClientBuilder, ComponentAClient } from "./gen/plexus-client";
import { ExampleServiceInvocationHandlerImpl } from "./app/ExampleServiceInvocationHandlerImpl";
import { WebSocketConnectionFactory } from "plexus-websocket-transport"
import * as plexus from "./gen/plexus-messages";


class App {

    public async start(): Promise<void> {

        const plexusClient: ComponentAClient = await new ComponentAClientBuilder()
            .withClientDetails({ applicationId: "com.plexus.components.ComponentA" })
            .withExampleServiceInvocationsHandler(new ExampleServiceInvocationHandlerImpl())
            .withTransportConnectionProvider(() => new WebSocketConnectionFactory(new WebSocket("ws://localhost:5509")).connect())
            .connect();

        // point to point
        const response = await plexusClient.getExampleServiceProxy().pointToPoint({ data: "Request!" });

        // dynamic invocation example
        plexusClient.sendUnaryRequest({
            targetMethodId: "PointToPoint",
            targetServiceId: "com.plexus.services.ExampleService",
            targetApplicationId: "com.plexus.components.ComponentB"
        },
            {
                data: "Request"
            },
            {
                value: (response: plexus.com.plexus.model.Response) => {
                    console.log(`Response ${JSON.stringify(response)}`);
                },
                error: (e) => { }
            }
            , plexus.com.plexus.model.Request, plexus.com.plexus.model.Response);

    }

}