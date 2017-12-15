
import { TransportConnection, ServerConnectionFactory } from "@plexus-interop/transport-common";
import { Subscription, Observer } from "@plexus-interop/common";
import { HostTransportConnection } from "./HostTransportConnection";
import { RemoteBrokerService } from "../../peers/remote/RemoteBrokerService";

export class HostConnectionFactory implements ServerConnectionFactory {

    public constructor(
        private readonly baseFactory: ServerConnectionFactory,
        private readonly remoteBrokerService: RemoteBrokerService
    ) { }

    public acceptConnections(connectionsObserver: Observer<TransportConnection>): Subscription {
        return this.baseFactory.acceptConnections({
            next: c => connectionsObserver.next(new HostTransportConnection(c, this.remoteBrokerService)),
            complete: () => connectionsObserver.complete(),
            error: e => connectionsObserver.error(e)
        });
    }

}