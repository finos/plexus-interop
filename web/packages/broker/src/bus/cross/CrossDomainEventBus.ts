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
import { Event } from "../Event";
import { EventBus } from "../EventBus";
import { Subscription, Logger, LoggerFactory, Observer, GUID } from "@plexus-interop/common";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/fromEvent";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import "rxjs/add/operator/publish";
import { IFrameHostMessage } from "./model/IFrameHostMessage";
import { SubscribeRequest } from "./model/SubscribeRequest";
import { ResponseType } from "./model/ResponseType";
import { MessageType } from "./model/MessageType";
import { PartialObserver } from "rxjs/Observer";

export class CrossDomainEventBus implements EventBus {

    private readonly log: Logger = LoggerFactory.getLogger("CrossDomainEventBus");

    private emitters: Map<string, Observer<any>> = new Map<string, Observer<any>>();
    private observables: Map<string, Observable<any>> = new Map<string, Observable<any>>();

    public constructor(
        private readonly hostIFrame: HTMLIFrameElement,
        private readonly hostOrigin: string) { }

    private sendAndSubscribe<T, ResType>(message: IFrameHostMessage<T, ResType>, observer: PartialObserver<IFrameHostMessage<T, ResType>>): Subscription {

        const responseType = message.responseType;
        const subscriptionKey = this.subscriptionKey(message);
        message.responseType = (!responseType || responseType === ResponseType.None) ? ResponseType.Stream : message.responseType;

        return this.sharedObservable<IFrameHostMessage<T, ResType>>(
            subscriptionKey,
            () => this.postToIFrame(message)).subscribe(observer);

    }

    private postToIFrame(message: any): void {
        this.hostIFrame.contentWindow.postMessage(message, this.hostOrigin);
    }

    public init(): Promise<EventBus> {
        this.createHostMessagesSubscription();
        return new Promise((resolve, reject) => {
            this.log.info("Host iFrame created, sending ping message");
            const message = this.hostMessage({}, MessageType.Ping, ResponseType.Single);
            this.sendAndSubscribe(message, {
                next: m => {
                    this.log.info("Success Ping response received");
                    resolve(this);
                },
                error: e => {
                    this.log.error("Failed to receive first Ping response");
                    reject(e);
                }
            });
        });
    }

    private createHostMessagesSubscription(): void {
        this.log.info("Creating subscription to Host iFrame");
        Observable.fromEvent<MessageEvent>(window, "message")
            .filter(event => {
                this.log.trace(`Received message from ${event.origin}`);
                return event.origin === this.hostOrigin;
            })
            .map(event => event.data)
            .filter(parsed => (parsed as IFrameHostMessage<any, any>).type !== undefined)
            .map(parsed => parsed as IFrameHostMessage<any, any>)
            .subscribe((m) => { this.handleHostMessage(m); });
    }

    private handleHostMessage<T, R>(hostMessage: IFrameHostMessage<T, R>): void {
        switch (hostMessage.responseType as ResponseType) {
            case ResponseType.Single:
                this.emitAndComplete(this.subscriptionKey(hostMessage), hostMessage);
                break;
            case ResponseType.Stream:
                this.emit(this.subscriptionKey(hostMessage), hostMessage);
                break;
            default:
                break;
        }
    }

    protected sharedObservable<T>(key: string, postInit?: (key: string, observable: Observable<T>) => void): Observable<T> {
        let eventsObservable = this.observables.get(key);
        if (eventsObservable === undefined) {
            eventsObservable = Observable.create((observer: Observer<T>) => {
                this.log.debug(`Creating ${key} observable`);
                this.emitters.set(key, observer);
                return () => {
                    this.log.debug(`Cleaning up ${key} observable`);
                    this.emitters.delete(key);
                    this.observables.delete(key);
                };
            }).publish().refCount() as Observable<T>;
            this.observables.set(key, eventsObservable);
            if (postInit) {
                postInit(key, eventsObservable);
            }
        }
        return eventsObservable;
    }

    private hostMessage<T, R>(requestPayload: T, type: MessageType<T, R>, responseType?: ResponseType): IFrameHostMessage<T, R> {
        responseType = responseType ? responseType : ResponseType.None;
        return { id: GUID.getNewGUIDString(), type, requestPayload, responseType };
    }

    private subscriptionKey(hostMessage: IFrameHostMessage<any, any>): string {
        switch (hostMessage.type.id) {
            case MessageType.Subscribe.id:
                let message = hostMessage as IFrameHostMessage<SubscribeRequest, any>;
                return message.type.id + (message.requestPayload ? message.requestPayload.topic : message.responsePayload.key);
            default:
                return hostMessage.id;
        }
    }

    public publish(topic: string, event: Event): void {
        const payload = event.payload;
        const message = this.hostMessage({ topic, payload }, MessageType.Publish);
        this.postToIFrame(message);
    }

    public subscribe(topic: string, handler: (event: Event) => void): Subscription {
        const message = this.hostMessage({ topic }, MessageType.Subscribe, ResponseType.Stream);
        return this.sendAndSubscribe<SubscribeRequest, Event>(message, {
            next: message => {
                handler(message.responsePayload as Event);
            }
        });
    }

    private emit(subscription: string, value: any, complete?: boolean): void {
        const observer = this.emitters.get(subscription);
        if (observer !== undefined) {
            observer.next(value);
            if (complete) {
                observer.complete();
            }
        }
    }

    private emitAndComplete(subscription: string, value: any): void {
        this.emit(subscription, value, true);
    }

}