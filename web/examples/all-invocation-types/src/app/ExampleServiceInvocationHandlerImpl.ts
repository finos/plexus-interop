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
import { ExampleServiceInvocationHandler } from "../gen/plexus-client";
import * as plexus from "../gen/plexus-messages";
import { Observer } from "@plexus-interop/common";
import { StreamingInvocationClient } from "@plexus-interop/client";

export class ExampleServiceInvocationHandlerImpl implements ExampleServiceInvocationHandler {

    public async onPointToPoint(request: plexus.com.plexus.model.IRequest): Promise<plexus.com.plexus.model.IResponse> {
        return plexus.com.plexus.model.Response.fromObject({
            result: "Response",
            status: plexus.com.plexus.model.Status.SUCCESS
        });
    }

    public onBidiStreaming(hostClient: StreamingInvocationClient<plexus.com.plexus.model.IResponse>): Observer<plexus.com.plexus.model.IRequest> {
        return {
            next: (request) => {
                console.log("Request received!", request);
                hostClient.next({
                    result: "Received",
                    status: plexus.com.plexus.model.Status.SUCCESS
                });
            },
            complete: () => {
                console.log("Remote completed!");
                hostClient.complete();
            },
            error: (e) => { }
        }
    }

    public onClientToServer(hostClient: StreamingInvocationClient<plexus.com.plexus.model.IResponse>): Observer<plexus.com.plexus.model.IRequest> {
        return {
            next: (request) => {
                console.log("Request received!", request);
                hostClient.next({
                    result: "Received",
                    status: plexus.com.plexus.model.Status.SUCCESS
                });
            },
            complete: () => {
                console.log("Remote completed!");
                hostClient.complete();
            },
            error: (e) => { }
        }
    }

    public onServerStreaming(request: plexus.com.plexus.model.IRequest, hostClient: StreamingInvocationClient<plexus.com.plexus.model.IResponse>): void {
        console.log("Request received!", request);
        hostClient.next("I've");
        hostClient.next("received");
        hostClient.next("message!");
        hostClient.complete();
    }

}