import { ActionType } from "./ActionType";
import { EventType } from "./events/EventType";
import { Subscription } from "@plexus-interop/common";

export interface PeerTransport {
    
    sendRequest<Req, Res>(actionType: ActionType<Req, Res>, requestPaylaod: Req): Promise<Res>;
    
    hostAction<Req, Res>(actionType: ActionType<Req, Res>, handler: (requestPaylaod: Req) => Promise<Res>): void;
    
    subscribe<T>(eventType: EventType<T>, handler: (payload: T) => void): Subscription;

    publish<T>(eventType: EventType<T>, payload: T): void;

}