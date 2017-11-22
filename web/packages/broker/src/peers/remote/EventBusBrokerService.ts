import { EventBus } from "../../bus/EventBus";
import { ActionType } from "../../peers/ActionType";
import { EventType } from "../events/EventType";
import { PartialObserver } from "rxjs/Observer";
import { Subscription, Observer, Logger, LoggerFactory } from "@plexus-interop/common";
import { RemoteBrokerService } from "./RemoteBrokerService";
import { Observable } from "rxjs/Observable";
import { RemoteActionResult, isFailed, isSucceded, isCompleted } from "./RemoteActionResult";



export class EventBusRemoteBrokerService implements RemoteBrokerService {
    
    private requestCounter: number = 0;

    private readonly log: Logger;

    public constructor(private readonly eventBus: EventBus, private readonly id: string) {
        this.log = LoggerFactory.getLogger(`EventBusRemoteBrokerService [${id}]`);
    }

    public invokeUnary<Req, Res>(actionType: ActionType<Req, Res>, requestPaylaod: Req, remoteBrokerId: string): Promise<Res> {
        throw 'Not Implemented';
    }

    public host<Req, Res>(actionType: ActionType<Req, Res>, handler: (requestPaylaod: Req) => Observable<Res>): void {
        throw 'Not Implemented';
    }

    public invoke<Req, Res>(actionType: ActionType<Req, Res>, requestPaylaod: Req, remoteBrokerId: string): Observable<Res> {

        const requestId = this.newRequestId();

        const requestTopic = this.requestTopic(remoteBrokerId, actionType);
        const responseTopic = this.responseTopic(remoteBrokerId, actionType, requestId);

        return Observable.create((invocationSubscriber: Observer<Res>) => {

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

            this.eventBusClient.publish(requestTopic, { payload: json }).then((response) => {
                log.debug(`${this.name}: Published to ${requestTopic}`);
                return response;
            });

        });

        throw 'Not Implemented';
    }

    public publish<T>(eventType: EventType<T>, payload: T, remoteBrokerId?: string): void {
        throw 'Not Implemented';
    }

    public subscribe<T>(eventType: EventType<T>, observer: PartialObserver<T>): Subscription {
        throw 'Not Implemented';
    }

    private responseTopic(remoteId: string, actionType: ActionType<any, any>, requestId: number): string  {
        return `res.${requestId}.${actionType.id}.${this.id}.${remoteId}`;
    }

    private requestTopic(remoteId: string, actionType: ActionType<any, any>): string  {
        return `req.${actionType.id}.${this.id}.${remoteId}`;
    }

    private newRequestId(): number {
        return this.requestCounter++;
    }    

}