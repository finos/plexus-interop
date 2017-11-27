import { EventBus } from "../../bus/EventBus";
import { ActionType } from "../../peers/ActionType";
import { EventType } from "../events/EventType";
import { PartialObserver } from "rxjs/Observer";
import { Subscription, Observer, Logger, LoggerFactory } from "@plexus-interop/common";
import { RemoteBrokerService } from "./RemoteBrokerService";
import { Observable } from "rxjs/Observable";
import { RemoteActionResult, isFailed, isSucceded, isCompleted, successResult, errorResult, completedResult } from "./RemoteActionResult";
import { EventBasedRequest } from "./EventBasedRequest";

export class EventBusRemoteBrokerService implements RemoteBrokerService {

    private requestCounter: number = 0;

    private readonly log: Logger;

    public constructor(private readonly eventBus: EventBus, private readonly id: string) {
        this.log = LoggerFactory.getLogger(`EventBusRemoteBrokerService [${id}]`);
    }

    public invokeUnary<Req, Res>(actionType: ActionType<Req, Res>, requestPaylaod: Req, remoteBrokerId: string): Promise<Res> {
        return new Promise((resolve, reject) => {
            let res: Res | null = null;
            this.invoke(actionType, requestPaylaod, remoteBrokerId, {
                next: update => {
                    res = update;
                },
                complete: () => res ? resolve(res) : reject(new Error("No updates before completion")),
                error: e => reject(e)
            });
        });
    }

    public host<Req, Res>(actionType: ActionType<Req, Res>, handler: (requestPaylaod: Req) => Observable<Res>, hostId: string): void {

        const requestTopic = this.requestTopic(hostId, actionType);

        this.eventBus.subscribe(requestTopic, event => {
            const requestEvent = event.payload as EventBasedRequest;
            this.log.trace(`Received [${actionType.id}.${requestEvent.requestId}] request to [${hostId}]`);
            const responseTopic = this.responseTopic(hostId, actionType, requestEvent.requestId);
            handler(requestEvent.payload).subscribe({
                next: update => {
                    this.eventBus.publish(responseTopic, { payload: successResult(update) })
                },
                error: e => {
                    this.eventBus.publish(responseTopic, { payload: errorResult(e) })
                },
                complete: () => {
                    this.eventBus.publish(responseTopic, { payload: completedResult() })
                }
            });
        });

    }

    public invoke<Req, Res>(actionType: ActionType<Req, Res>, requestPaylaod: Req, remoteBrokerId: string, observer: PartialObserver<Res>): Subscription {

        this.log.trace(`Sending invocation ${actionType.id} to ${remoteBrokerId}`);

        const requestId = this.newRequestId();
        const requestTopic = this.requestTopic(remoteBrokerId, actionType);
        const responseTopic = this.responseTopic(remoteBrokerId, actionType, requestId);

        return new Observable((invocationSubscriber: Observer<Res>) => {

            this.eventBus.subscribe(responseTopic, (event) => {
                this.log.trace(`Received update for ${responseTopic}`);
                const invocationResult = event.payload as RemoteActionResult;
                if (isFailed(invocationResult)) {
                    invocationSubscriber.error(invocationResult.error);
                } else if (isCompleted(invocationResult)) {
                    invocationSubscriber.complete();
                } else {
                    invocationSubscriber.next(invocationResult.payload);
                }
            });

            this.log.trace(`Sending request to ${requestTopic}`);
            this.eventBus.publish(requestTopic, {
                payload: {
                    requestPaylaod,
                    requestId
                }
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

    private responseTopic(remoteId: string, actionType: ActionType<any, any>, requestId: number | string): string {
        return `res.${requestId}.${actionType.id}.${this.id}.${remoteId}`;
    }

    private eventTopic(eventType: EventType<any>, remoteId?: string): string {
        return `event.${eventType.id}${remoteId ? "." + remoteId : ""}`;
    }

    private requestTopic(remoteId: string, actionType: ActionType<any, any>): string {
        return `req.${actionType.id}.${this.id}.${remoteId}`;
    }

    private newRequestId(): number {
        return this.requestCounter++;
    }

}