import { AppConnectionHeartBit } from "./AppConnectionHeartBit";


export class EventType<PayloadType> {
    
    // tslint:disable-next-line:variable-name
    public static readonly AppConnectionHearBit: EventType<AppConnectionHeartBit> = new  EventType<AppConnectionHeartBit>("AppConnection");

    constructor(public readonly id: string) {}

}