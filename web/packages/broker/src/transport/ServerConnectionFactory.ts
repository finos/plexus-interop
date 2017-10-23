import { Observer } from "@plexus-interop/common";
import { TransportConnection } from "@plexus-interop/transport-common";
import { Subscription } from "rxjs/Subscription";


export interface ServerConnectionFactory {

    acceptConnections(connectionsObserver: Observer<TransportConnection>): Subscription;

}