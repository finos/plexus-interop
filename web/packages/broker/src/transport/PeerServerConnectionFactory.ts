import { ServerConnectionFactory } from "./ServerConnectionFactory";
import { Observer, Subscription, AnynymousSubscription } from "@plexus-interop/common";
import { TransportConnection } from "@plexus-interop/transport-common";
import { PeerTransport } from "../bus/PeerTransport";

export class PeerServerConnectionFactory implements ServerConnectionFactory {

    constructor(private readonly peerTransport: PeerTransport) {}

    public acceptConnections(connectionsObserver: Observer<TransportConnection>): Subscription {
        return new AnynymousSubscription();
    }

    private listenForPeerConnections(): void {
        this.peerTransport.subscribe()
    }

}