import { TransportConnection } from "@plexus-interop/transport-common";
import { AppRegistryProvider } from "../metadata/apps/AppRegistryProvider";
import { InteropRegistryProvider } from "../metadata/interop/InteropRegistryProvider";
import { Logger, LoggerFactory } from "@plexus-interop/common";
import { AppRegistryService } from "../metadata/apps/AppRegistryService";
import { EventBus } from "../bus/EventBus";
import { RemoteBrokerService } from "../peers/remote/RemoteBrokerService";
import { EventBusRemoteBrokerService } from "../peers/remote/EventBusBrokerService";
import { InMemoryConnectionFactory } from "../../../transport-common/src/transport/InMemoryConnectionFactory";
import { PeerConnectionsService } from "../peers/PeerConnectionsService";
import { PeerServerConnectionFactory } from "../peers/PeerServerConnectionFactory";
import { MultiSourcesConnectionFactory } from "../transport/MultiSourcesConnectionFactory";
import { Broker } from "../broker/Broker";
import { PeerAppLifeCycleManager } from "../peers/PeerAppLifeCycleManager";
import { HostTransportConnection } from "../peers/host/HostTransportConnection";

export class WebBrokerConnectionBuilder {

    private readonly log: Logger = LoggerFactory.getLogger("WebBrokerConnectionBuilder");

    public constructor() { }

    private appRegistryProviderFactory: () => Promise<AppRegistryProvider>;

    private interopRegistryProviderFactory: () => Promise<InteropRegistryProvider>;

    private eventBusProvider: () => Promise<EventBus>;

    public async connect(): Promise<TransportConnection> {

        this.log.info("Initialyzing App Registry Provider");
        const appRegistryProvider = await this.appRegistryProviderFactory();

        this.log.info("Initialyzing Interop Registry Provider");
        const interopRegistryProvider = await this.interopRegistryProviderFactory();
        const appRegistryService = new AppRegistryService(appRegistryProvider);

        const inMemoryConnectionFactory = new InMemoryConnectionFactory();
        this.log.debug("Creating in memory host connection");
        const inMemoryClientConnection: TransportConnection = await inMemoryConnectionFactory.connect();

        this.log.info("Initialyzing Event Bus");
        const eventBus = await this.eventBusProvider();

        const remoteBrokerService: RemoteBrokerService = new EventBusRemoteBrokerService(eventBus, inMemoryClientConnection.uuid().toString());

        const peerConnectionService: PeerConnectionsService = new PeerConnectionsService(remoteBrokerService);
        const peerConnectionsFactory = new PeerServerConnectionFactory(peerConnectionService, remoteBrokerService);
        const brokerConnectionsFactory = new MultiSourcesConnectionFactory(inMemoryConnectionFactory, peerConnectionsFactory);

        const appLifeCycleManager = new PeerAppLifeCycleManager(peerConnectionService, appRegistryService);

        this.log.info("Starting to listen for remote connections");
        new Broker(appLifeCycleManager, brokerConnectionsFactory, interopRegistryProvider).start();

        return new HostTransportConnection(inMemoryClientConnection, remoteBrokerService);
    }

}