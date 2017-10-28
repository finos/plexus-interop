import { AppConnectionHeartBit } from "./events/AppConnectionHeartBit";
import { Observer, Subscription, Logger, LoggerFactory } from "@plexus-interop/common";
import { PartialObserver } from "rxjs/Observer";
import { PeerTransport } from "./PeerTransport";
import { Observable } from "rxjs/Observable";
import { EventType } from "./events/EventType";
import "rxjs/add/operator/share";

export class PeerConnectionsService {

    private readonly log: Logger = LoggerFactory.getLogger("PeerConnectionService");

    constructor(private peerTransport: PeerTransport) {}

    private $heartbits: Observable<AppConnectionHeartBit>;

    private createInternalObservables() {
        this.$heartbits = new Observable(observer => {
            this.log.debug("Subscribing to app hearbits");
            const sourceSubscription = this.peerTransport.subscribe(EventType.AppConnectionHearBit, (heartBit: AppConnectionHeartBit) => {
                observer.next(heartBit);
            });
            return () => {
                this.log.debug("Unsubscribing from app hearbits");
                sourceSubscription.unsubscribe();
            }
        })
        // important, make observable shared between multiple subscriptions
        .share();
    }

    public subscribeToConnectionsHearBits(observer: PartialObserver<AppConnectionHeartBit>): Subscription {
        return this.$heartbits.subscribe(observer);
    }

}