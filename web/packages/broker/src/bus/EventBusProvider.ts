import { EventBus } from "./EventBus";

export interface EventBusProvider {

    create(): Promise<EventBus>;

}