import { AppLifeCycleManager } from "../lifecycle/AppLifeCycleManager";
import { TransportConnection, TransportChannel } from "@plexus-interop/transport-common";
import { StateMaschine, StateMaschineBase, ReadWriteCancellationToken, Logger, LoggerFactory } from "@plexus-interop/common";
import { ServerConnectionFactory } from "../transport/ServerConnectionFactory";
import { InteropMetadata } from "../metadata/InteropMetadata";

enum BrokerState { CREATED, OPEN, CLOSED };

export class Broker {

    private readonly state: StateMaschine<BrokerState>;

    private readonly cancellationToken: ReadWriteCancellationToken = new ReadWriteCancellationToken();

    private readonly log: Logger = LoggerFactory.getLogger("Broker");

    constructor(
        private appLifeCycleManager: AppLifeCycleManager,
        private connectionFactory: ServerConnectionFactory,
        private interopMetadata: InteropMetadata
    ) {
        this.state = this.defineStateMaschine();
        this.log.trace("Created");
        this.start();
    }

    private start(): void {
        this.log.debug("Starting to listen for incoming connections");
        this.connectionFactory.acceptConnections({
            next: this.handleIncomingConnection.bind(this),
            error: e => {},
            complete: () => {}
        });
    }

    private defineStateMaschine(): StateMaschine<BrokerState> {
        return new StateMaschineBase(BrokerState.CREATED, [
            {
                from: BrokerState.CREATED, to: BrokerState.OPEN
            },
            {
                from: BrokerState.OPEN, to: BrokerState.CLOSED, preHandler: async () => this.cancellationToken.cancel("Closed")
            }
        ]);
    }

    private handleIncomingConnection(transportConnection: TransportConnection): void {
        
    }

}