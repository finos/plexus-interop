import { EventBus } from "../EventBus";
import { Event } from "../Event";
import "jStorage";
import { Subscription, Logger, LoggerFactory, AnonymousSubscription } from "@plexus-interop/common";

const globalObj: any = global || window;

export class JStorageEventBus implements EventBus {

    private readonly log: Logger;

    private jStorage: JStorageStatic = globalObj.$.jStorage;

    public constructor(readonly namespace: string = "plexus-bus") {
        this.log = LoggerFactory.getLogger(`SameDomainEventBus [${namespace}]`);
    }

    public publish(key: string, event: Event): void {
        const topic = this.internalKey(key);
        this.log.info(`Publishing event to ${topic}`);
        this.jStorage.publish(topic, event.payload);
    }

    public subscribe(key: string, handler: (event: Event) => void): Subscription {
        const topic = this.internalKey(key);
        // TODO handle unsubscribe
        this.jStorage.subscribe(this.internalKey(key), (channel: string, value: any) => {
            this.log.trace(`Received update for ${topic}`);
            handler({ payload: value });
        });
        return new AnonymousSubscription();
    }

    private internalKey(key: string): string {
        return `${this.namespace}:${key}`;
    }
}