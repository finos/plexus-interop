import { AppLifeCycleManager } from "./AppLifeCycleManager";
import { TransportConnection, UniqueId } from "@plexus-interop/transport-common";
import { ApplicationConnectionDescriptor } from "./ApplicationConnectionDescriptor";
import { ApplicationConnection } from "./ApplicationConnection";
import { PeerEventBus } from "../bus/PeerEventBus";
import { Cache, InMemoryCache } from "@plexus-interop/common";
import { ApplicationDescriptor } from "./ApplicationDescriptor";
import { CacheEntry } from "../../../common/src/cache/CacheEntry";

/**
 * Manages one client connection and proxy connections for peer brokers
 */
export class PeerAppLifeCycleManager implements AppLifeCycleManager {

    private onlineConnections: Cache = new InMemoryCache();

    constructor(
        private readonly peerEventBus: PeerEventBus 
    ) { }

    public async acceptConnection(connection: TransportConnection, appDescriptor: ApplicationDescriptor): Promise<ApplicationConnection> {
        const connectionId = UniqueId.generateNew();
        const {applicationId, instanceId} = appDescriptor;
        const appConnection: ApplicationConnection = {
            descriptor: {
                connectionId,
                applicationId, 
                instanceId
            },  
            connection
        };
        // current client's connection, not expiration
        this.onlineConnections.set(connectionId.toString(), new CacheEntry(appConnection));
        return appConnection;
    }

    public async getOrSpawnConnection(applicationId: string): Promise<ApplicationConnectionDescriptor> {
        const appConnections = this.getOnlineConnectionsInternal()
            .filter(connection => connection.applicationId === applicationId);
        return appConnections.length > 0 ? appConnections[0] : this.spawnConnection(applicationId);
    }

    public spawnConnection(applicationId: string): Promise<ApplicationConnectionDescriptor> {
        // TODO
        throw "Not implemented";
    }

    public async getOnlineConnections(): Promise<ApplicationConnectionDescriptor[]> {
        return this.getOnlineConnectionsInternal();
    }

    private getOnlineConnectionsInternal(): ApplicationConnectionDescriptor[] {
        return this.onlineConnections.keys()
            .map(k => this.onlineConnections.get<ApplicationConnection>(k))
            .filter(v => !!v)
            .map(connection => (connection as ApplicationConnection).descriptor);
    }
}

