import { ServerConnectionFactory } from "./ServerConnectionFactory";
import { Observer, Subscription, Logger, LoggerFactory, BufferedObserver, AnonymousSubscription } from "@plexus-interop/common";
import { TransportConnection, UniqueId } from "@plexus-interop/transport-common";
import { PeerTransport } from "../bus/PeerTransport";
import { EventType } from "../bus/events/EventType";
import { AppConnectionHeartBit } from "../bus/events/AppConnectionHeartBit";
import { PeerConnectionsService } from "../bus/PeerConnectionsService";
import { ApplicationConnectionDescriptor } from "../lifecycle/ApplicationConnectionDescriptor";
import { PeerProxyConnection } from "../lifecycle/PeerProxyConnection";

export class PeerServerConnectionFactory implements ServerConnectionFactory {

    private readonly log: Logger = LoggerFactory.getLogger("PeerServerConnectionFactory");

    private readonly processedConnections: Set<string> = new Set();

    private readonly connectionsObserver: BufferedObserver<TransportConnection> = new BufferedObserver(100, this.log);

    constructor(private readonly peerConnectionsService: PeerConnectionsService) {
        this.listenForPeerConnections();
    }

    public acceptConnections(connectionsObserver: Observer<TransportConnection>): Subscription {
        this.connectionsObserver.setObserver(connectionsObserver);
        return new AnonymousSubscription();
    }

    private listenForPeerConnections(): void {
        this.peerConnectionsService.subscribeToConnectionsHearBits({
            next: (connectionDescriptor: AppConnectionHeartBit) => {
                // create proxy connection only once
                if (!this.processedConnections.has(connectionDescriptor.connectionId)) {
                    this.log.debug(`Detected new connection, app id ${connectionDescriptor.applicationId}`);
                    const appConnectionDescriptor: ApplicationConnectionDescriptor = {
                        applicationId: connectionDescriptor.applicationId,
                        instanceId: connectionDescriptor.instanceId,
                        connectionId: UniqueId.fromString(connectionDescriptor.connectionId)
                    };
                    this.connectionsObserver.next(new PeerProxyConnection(appConnectionDescriptor));
                }
            }
        });
    }

}