import { ServerConnectionFactory } from "./ServerConnectionFactory";
import { Observer } from "@plexus-interop/common";
import { TransportConnection } from "@plexus-interop/transport-common";
import { Subscription } from "rxjs/Subscription";
import { PeerBrokerEvenBus } from "../bus/PeerBrokerEventBus";

export class PeerBrokerConnectionFactory implements ServerConnectionFactory {
    
    constructor(private readonly brokerEventBus: PeerBrokerEvenBus) {}

    public acceptConnections(connectionsObserver: Observer<TransportConnection>): Subscription {
        // TODO
        throw "Not Implemented";
    }
} 