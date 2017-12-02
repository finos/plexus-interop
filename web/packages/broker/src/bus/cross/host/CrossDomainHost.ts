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
import { EventBus } from "../../EventBus";
import { Event } from "../../Event";
import { StateMaschine, StateMaschineBase, LoggerFactory, Logger, Subscription } from "@plexus-interop/common";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/fromEvent";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import { IFrameHostMessage } from "../model/IFrameHostMessage";
import { CrossDomainHostConfig } from "./CrossDomainHostConfig";
import { MessageType } from "../model/MessageType";
import { HostState } from "./HostState";
import { HostMessageEvent } from "./HostMessageEvent";
import { PublishRequest } from "../model/PublishRequest";
import { SubscribeRequest } from "../model/SubscribeRequest";

export class CrossDomainHost {

    private readonly log: Logger = LoggerFactory.getLogger("CrossDomainHost");

    private readonly parentWin: Window;

    private stateMaschine: StateMaschine<HostState> = new StateMaschineBase<HostState>(HostState.CREATED, [], this.log);

    public constructor(
        private readonly internalBus: EventBus,
        private readonly config: CrossDomainHostConfig
    ) {
        this.parentWin = window.parent;
    }

    public async connect(): Promise<void> {
        this.stateMaschine.throwIfNot(HostState.CREATED);
        this.initCommunicationWithParent();
        this.stateMaschine.go(HostState.CONNECTED);
    }

    private whiteListed(message: MessageEvent): boolean {
        const { origin, source } = message;
        return source === this.parentWin
            && this.config.whiteListedUrls
            && !!this.config.whiteListedUrls.find(pattern => pattern === "*" || origin.endsWith(pattern));
    }

    private initCommunicationWithParent(): void {
        Observable.fromEvent<MessageEvent>(window, "message")
            .filter(this.whiteListed)
            .map((event) => {
                return {
                    message: event.data as IFrameHostMessage<any, any>,
                    sourceWindow: event.source,
                    sourceOrigin: event.origin
                };
            })
            .filter((parsed) =>
                parsed.message.type !== undefined
                && parsed.message.requestPayload !== undefined
                && !parsed.message.responsePayload)
            .subscribe({
                next: msg => this.handleParentMessage(msg),
                error: e => this.log.error("Error from parent messages subscription", e)
            });
    }

    private sendToParent<T, R>(message: IFrameHostMessage<T, R>, source: Window, origin: string): void {
        source.postMessage(message, origin);
    }

    private handleParentMessage(parsedEvent: HostMessageEvent): void {
        const message = parsedEvent.message;
        switch (message.type.id) {
            case MessageType.Ping.id:
                this.log.trace("Received ping request");
                message.responsePayload = {};
                this.sendToParent(
                    message,
                    parsedEvent.sourceWindow,
                    parsedEvent.sourceOrigin);
                break;
            case MessageType.Publish.id:
                const pubMsg = message as IFrameHostMessage<PublishRequest, {}>;
                const requestPayload = pubMsg.requestPayload as PublishRequest;
                this.log.trace(`Received publish request, [${requestPayload.topic}]`);
                this.internalBus.publish(requestPayload.topic, { payload: requestPayload.payload });
                break;
            case MessageType.Subscribe.id:
                const subMsg = message as IFrameHostMessage<SubscribeRequest, Event>;
                const request = subMsg.requestPayload as SubscribeRequest;
                this.log.trace(`Received subscribe request, [${request.topic}]`);
                this.internalBus.subscribe(request.topic, event => {
                    subMsg.responsePayload = {
                        payload: event.payload
                    };
                });
                break;
            default:
                this.log.error(`Unsupported message type ${message.type.id}`);
                break;
        }
    }

}