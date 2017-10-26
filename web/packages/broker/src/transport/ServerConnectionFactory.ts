import { Observer } from "@plexus-interop/common";
import { TransportConnection } from "@plexus-interop/transport-common";

export interface ServerConnectionFactory {

    acceptConnections(connectionsObserver: Observer<TransportConnection>): void;

}