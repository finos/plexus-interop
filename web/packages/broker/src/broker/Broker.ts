import { AppLifeCycleManager } from "../lifecycle/AppLifeCycleManager";
import { TransportConnection, TransportChannel } from "@plexus-interop/transport-common";
import { StateMaschine, StateMaschineBase, ReadWriteCancellationToken, Logger, LoggerFactory } from "@plexus-interop/common";
import { ServerConnectionFactory } from "../transport/ServerConnectionFactory";

enum BrokerState { CREATED, OPEN, CLOSED };

export class Broker {

    private readonly state: StateMaschine<BrokerState>;

    private readonly cancellationToken: ReadWriteCancellationToken = new ReadWriteCancellationToken();

    private readonly log: Logger = LoggerFactory.getLogger("Broker");

    constructor(
        private appLifeCycleManager: AppLifeCycleManager,
        private connectionFactory: ServerConnectionFactory
    ) {
        this.state = this.defineStateMaschine();
        this.log.trace("Created");
        this.start();
    }

    private start(): void {
        this.log.debug("Starting to listen for incoming channels");
        this.listenForChannels()
            .catch(e => {
                // TODO disconnect and clean up
                this.log.error("Failed on listening of incoming channel", e);
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
    /*

    private async listenForChannels(): Promise<void> {
        while (this.state.is(BrokerState.OPEN)) {
            const channel = await this.clientConnection.waitForChannel(this.cancellationToken.getReadToken());
            this.handleIncomingChannel(channel);
        }
    }

    private handleIncomingChannel(channel: TransportChannel): void {
        const channelId = channel.uuid().toString();
        channel.open({
            started: () => {
                if (this.log.isTraceEnabled()) {
                    this.log.trace(`[${channelId}] Started`);
                }
            },
            startFailed: (error) => {
                this.log.error(`Channel [${channelId}] failed to start`);
                // TODO clean up channel resources
            },
            next: (data) => {
                if (this.log.isTraceEnabled()) {
                    this.log.trace(`[${channelId}] Received payload of ${data.byteLength} bytes`);
                }
            },
            complete: () => {},
            error: (e) => {}
        });
    }
    */

}