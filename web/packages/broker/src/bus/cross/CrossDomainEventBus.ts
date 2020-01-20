/**
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
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
import { Event } from '../Event';
import { EventBus } from '../EventBus';
import { Subscription, Logger, LoggerFactory, Observer, GUID, StateMaschine, StateMaschineBase } from '@plexus-interop/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/publish';
import { IFrameHostMessage } from './model/IFrameHostMessage';
import { SubscribeRequest } from './model/SubscribeRequest';
import { ResponseType } from './model/ResponseType';
import { MessageType } from './model/MessageType';
import { PartialObserver } from 'rxjs/Observer';
import { Defaults } from '@plexus-interop/transport-common';

enum State {
    CREATED = 'CREATED',
    CONNECTED = 'CONNECTED',
    CLOSED = 'CLOSED'
}

export class CrossDomainEventBus implements EventBus {

    private readonly log: Logger = LoggerFactory.getLogger('CrossDomainEventBus');

    private readonly singleOperationTimeOut: number = Defaults.OPERATION_TIMEOUT;
    private readonly pingTimeoutInMillis: number = 1000;

    private readonly emitters: Map<string, Observer<any>> = new Map<string, Observer<any>>();
    private readonly observables: Map<string, Observable<any>> = new Map<string, Observable<any>>();
    private readonly rejectTimeouts: Map<string, NodeJS.Timer> = new Map<string, NodeJS.Timer>();

    private hostIframeEventsSubscription: Subscription;

    private readonly stateMaschine: StateMaschine<State> = new StateMaschineBase(State.CREATED, [
        { from: State.CREATED, to: State.CONNECTED },
        { from: State.CONNECTED, to: State.CLOSED }
    ], this.log);

    public constructor(
        private readonly hostIFrame: HTMLIFrameElement,
        private readonly hostOrigin: string) { }


    public init(): Promise<EventBus> {
        this.stateMaschine.throwIfNot(State.CREATED);
        this.createHostMessagesSubscription();
        this.log.info('Host iFrame created, sending ping messages');        
        return this.chainRetries(20, () => this.sendPingToHost(this.pingTimeoutInMillis))
            .then(() => this);
    }

    public async disconnect(): Promise<void> {
        this.stateMaschine.throwIfNot(State.CONNECTED);
        this.stateMaschine.go(State.CLOSED);
        if (this.hostIframeEventsSubscription) {
            this.log.info('Unsubsribing from Host iFrame');
            this.hostIframeEventsSubscription.unsubscribe();
        }
        this.emitters.forEach((v, k) => v.error('Disconnected from Host iFrame'));
        this.emitters.clear();
        this.observables.clear();
    }

    public publish(topic: string, event: Event): void {
        this.stateMaschine.throwIfNot(State.CONNECTED);
        const payload = event.payload;
        if (this.log.isTraceEnabled()) {
            this.log.trace(`Publishing to [${topic}]`, payload);
        }
        const message = this.hostMessage({ topic, payload }, MessageType.Publish);
        this.postToIFrame(message);
    }

    public subscribe(topic: string, handler: (event: Event) => void): Subscription {
        this.stateMaschine.throwIfNot(State.CONNECTED);
        const message = this.hostMessage({ topic }, MessageType.Subscribe, ResponseType.Stream);
        return this.sendAndSubscribe<SubscribeRequest, Event>(message, {
            next: message => handler(message.responsePayload as Event)
        });
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

    protected clearEmitter(key: string): void {
        this.emitters.delete(key);
        this.observables.delete(key);
    }

    private sendAndSubscribe<T, ResType>(
        message: IFrameHostMessage<T, ResType>,
        observer: PartialObserver<IFrameHostMessage<T, ResType>>,
        rejectTimeout: number = this.singleOperationTimeOut): Subscription {

        const responseType = message.responseType;
        const subscriptionKey = this.subscriptionKey(message);
        message.responseType = (!responseType || responseType === ResponseType.None) ? ResponseType.Stream : message.responseType;

        return this.sharedObservable<IFrameHostMessage<T, ResType>>(
            subscriptionKey,
            () => {
                this.postToIFrame(message);
                if (message.responseType === ResponseType.Single) {
                    this.rejectTimeouts.set(subscriptionKey, setTimeout(() => {
                        const errorMsg = `Operation's timeout passed ${rejectTimeout}`;
                        this.log.warn(errorMsg);
                        this.emitError(subscriptionKey, errorMsg);
                        this.rejectTimeouts.delete(subscriptionKey);
                    }, rejectTimeout));
                }
            }).subscribe(observer);

    }

    private chainRetries(times: number, fn: () => Promise<void>): Promise<void> {
        let res = fn();
        for (let index = 0; index < times; index++) {
            res = res.catch(fn);
        }
        return res;
    }

    private sendPingToHost(timeout: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.log.info('Sending ping message');        
            const message = this.hostMessage({}, MessageType.Ping, ResponseType.Single);
            this.sendAndSubscribe(message, {
                next: m => {
                    this.log.info('Success ping response received');
                    this.stateMaschine.go(State.CONNECTED);
                    resolve();
                },
                error: e => {
                    this.log.warn('Failed to receive ping response', e);
                    reject(e);
                }
            }, timeout);
        });
    }

    private postToIFrame(message: any): void {
        const contentWindow = this.hostIFrame.contentWindow;
        if (contentWindow) {
            contentWindow.postMessage(message, this.hostOrigin);
        } else {
            this.log.warn('Content window is empty');
        }
    }

    private clearRejectTimeout(key: string): void {
        const timeout = this.rejectTimeouts.get(key);
        if (timeout) {
            this.log.trace(`Clearing reject timeout for ${key}`);
            clearTimeout(timeout);
            this.rejectTimeouts.delete(key);
        }
    }

    private createHostMessagesSubscription(): void {
        this.log.info('Creating subscription to Host iFrame');
        this.hostIframeEventsSubscription = Observable.fromEvent<MessageEvent>(window, 'message')
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
                this.log.error(`Unsupported host message type ${hostMessage.responseType}`);
                break;
        }
    }

    private hostMessage<T, R>(requestPayload: T, type: MessageType<T, R>, responseType?: ResponseType): IFrameHostMessage<T, R> {
        responseType = responseType ? responseType : ResponseType.None;
        return { id: GUID.getNewGUIDString(), type, requestPayload, responseType };
    }

    private subscriptionKey(hostMessage: IFrameHostMessage<any, any>): string {
        switch (hostMessage.type.id) {
            case MessageType.Subscribe.id:
                let message = hostMessage as IFrameHostMessage<SubscribeRequest, any>;
                return message.type.id + '.' + (message.requestPayload ? message.requestPayload.topic : message.responsePayload.key);
            default:
                return hostMessage.id;
        }
    }

    private emit(subscription: string, value: any, complete?: boolean): void {
        this.clearRejectTimeout(subscription);
        const observer = this.emitters.get(subscription);
        if (observer !== undefined) {
            observer.next(value);
            if (complete) {
                observer.complete();
                this.clearEmitter(subscription);
            }
        }
    }

    private emitError(subscription: string, error: string): void {
        let observer = this.emitters.get(subscription);
        if (observer) {
            observer.error(new Error(error));
            this.clearEmitter(subscription);
        }
    }

    private emitAndComplete(subscription: string, value: any): void {
        this.emit(subscription, value, true);
    }

}