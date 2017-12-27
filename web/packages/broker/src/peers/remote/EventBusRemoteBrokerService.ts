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
import { EventBus } from "../../bus/EventBus";
import { ActionType } from "../../peers/ActionType";
import { EventType } from "../events/EventType";
import { PartialObserver } from "rxjs/Observer";
import { Subscription, Observer, Logger, LoggerFactory } from "@plexus-interop/common";
import { RemoteBrokerService } from "./RemoteBrokerService";
import { Observable } from "rxjs/Observable";
import { RemoteActionResult, isFailed, isCompleted, successResult, errorResult, completedResult } from "./RemoteActionResult";
import { EventBasedRequest } from "./EventBasedRequest";

export class EventBusRemoteBrokerService implements RemoteBrokerService {

    private requestCounter: number = 0;

    private readonly log: Logger;

    public constructor(private readonly eventBus: EventBus, private readonly id: string) {
        this.log = LoggerFactory.getLogger(`EventBusRemoteBrokerService [${id}]`);
    }

    public invokeUnary<Req, Res>(actionType: ActionType<Req, Res>, requestPayload: Req, remoteBrokerId: string): Promise<Res> {
        return new Promise((resolve, reject) => {
            let res: Res | null = null;
            this.invoke(actionType, requestPayload, remoteBrokerId, {
                next: update => {
                    res = update;
                },
                complete: () => {
                    if (!res) {
                        this.log.trace(`[${actionType.id}] - No response, resolve with empty object`);
                    } 
                    resolve(res || {} as Res);
                },
                error: e => reject(e)
            });
        });
    }

    public host<Req, Res>(actionType: ActionType<Req, Res>, handler: (requestPaylaod: Req, observer: PartialObserver<Res>) => Subscription, hostId: string): void {

        const requestTopic = this.requestTopic(hostId, actionType);

        this.eventBus.subscribe(requestTopic, event => {
            const requestEvent = event.payload as EventBasedRequest;
            const senderId = requestEvent.senderId;
            if (this.log.isTraceEnabled()) {
                this.log.trace(`Received [${actionType.id}.${requestEvent.requestId}] request from [${senderId}]`);
            }
            const responseTopic = this.responseUpdateTopic(senderId, actionType, requestEvent.requestId);
            handler(requestEvent.payload, {
                next: update => {
                    this.eventBus.publish(responseTopic, { payload: successResult(update) });
                },
                error: e => {
                    this.eventBus.publish(responseTopic, { payload: errorResult(e) });
                },
                complete: () => {
                    this.eventBus.publish(responseTopic, { payload: completedResult() });
                }
            });
        });

    }

    public invoke<Req, Res>(actionType: ActionType<Req, Res>, requestPayload: Req, remoteBrokerId: string, observer: PartialObserver<Res>): Subscription {

        this.log.trace(`Sending invocation ${actionType.id} to ${remoteBrokerId}`);

        const requestId = this.newRequestId();
        const requestTopic = this.requestTopic(remoteBrokerId, actionType);
        const responseTopic = this.responseHandlingTopic(remoteBrokerId, actionType, requestId);

        return new Observable((invocationSubscriber: Observer<Res>) => {

            const subscription = this.eventBus.subscribe(responseTopic, (event) => {
                this.log.trace(`Received update for ${responseTopic}`);
                const invocationResult = event.payload as RemoteActionResult;
                if (isFailed(invocationResult)) {
                    subscription.unsubscribe();                    
                    invocationSubscriber.error(invocationResult.error);
                } else if (isCompleted(invocationResult)) {
                    subscription.unsubscribe();                                        
                    invocationSubscriber.complete();
                } else {
                    invocationSubscriber.next(invocationResult.payload);
                }
            });

            this.log.trace(`Sending request to ${requestTopic}`);
            const payload: EventBasedRequest = {
                payload: requestPayload,
                requestId: requestId.toString(),
                senderId: this.id
            };
            
            this.eventBus.publish(requestTopic, {
                payload
            });

        }).subscribe(observer);

    }

    public publish<T>(eventType: EventType<T>, payload: T, remoteBrokerId?: string): void {
        const requestTopic = this.eventTopic(eventType, remoteBrokerId);
        this.log.trace(`Publishing to ${requestTopic}`);
        this.eventBus.publish(requestTopic, {
            payload
        });
    }

    public subscribe<T>(eventType: EventType<T>, observer: PartialObserver<T>, remoteBrokerId?: string): Subscription {
        const requestTopic = this.eventTopic(eventType, remoteBrokerId);
        this.log.trace(`Subscribing to ${requestTopic}`);
        return new Observable((observer: Observer<T>) => {
            this.eventBus.subscribe(requestTopic, event => {
                observer.next(event.payload);
            });
        }).subscribe(observer);
    }

    private responseHandlingTopic(remoteId: string, actionType: ActionType<any, any>, requestId: number | string): string {
        return `res.${requestId}.${actionType.id}.${remoteId}.${this.id}`;
    }

    private responseUpdateTopic(remoteId: string, actionType: ActionType<any, any>, requestId: number | string): string {
        return `res.${requestId}.${actionType.id}.${this.id}.${remoteId}`;
    }

    private eventTopic(eventType: EventType<any>, remoteId?: string): string {
        return `event.${eventType.id}${remoteId ? "." + remoteId : ""}`;
    }

    private requestTopic(remoteId: string, actionType: ActionType<any, any>): string {
        return `req.${actionType.id}.${remoteId}`;
    }

    private newRequestId(): number {
        return this.requestCounter++;
    }

}