import { TransportConnection, TransportChannel } from "@plexus-interop/transport-common";
import { Observer, Logger, LoggerFactory } from "@plexus-interop/common";
import { UniqueId, clientProtocol } from "@plexus-interop/protocol";
import { RemoteBrokerService } from "../remote/RemoteBrokerService";
import { ActionType } from "../ActionType";
import { RemoteActions } from "../actions/RemoteActions";
import { CreateChannelResponse } from "../actions/CreateChannelResponse";
import { Observable } from "rxjs/Observable";
import { ChannelRequest } from "../actions/ChannelRequest";

export type DisconnectListener = (completion?: clientProtocol.ICompletion) => void;

export class HostTransportConnection implements TransportConnection {

    private readonly disconnectListeners: DisconnectListener[] = [];

    private readonly stringUuid: string;

    private readonly log: Logger;

    public constructor(
        private readonly baseConnection: TransportConnection,
        private readonly remoteBrokerService: RemoteBrokerService) {
        this.log = LoggerFactory.getLogger(`HostTransportConnection [${this.baseConnection}]`);
        this.stringUuid = this.uuid().toString();
    }

    public connect(channelObserver: Observer<TransportChannel>): Promise<void> {
        return this.baseConnection.connect(channelObserver);
    }

    public isConnected(): boolean {
        return this.baseConnection.isConnected();
    }

    public uuid(): UniqueId {
        return this.baseConnection.uuid();
    }

    public getManagedChannels(): TransportChannel[] {
        return this.baseConnection.getManagedChannels();
    }

    public getManagedChannel(id: string): TransportChannel | undefined {
        return this.baseConnection.getManagedChannel(id);
    }

    public onDisconnect(disconnectListener: DisconnectListener): void {
        this.disconnectListeners.push(disconnectListener);
    }

    public disconnect(completion?: clientProtocol.ICompletion): Promise<void> {
        this.log.trace("Disconnect requested, passing to listeners");
        this.disconnectListeners.forEach(l => l(completion));
        this.log.trace("Disconnecting from base connection");
        return this.baseConnection.disconnect(completion);
    }

    public createChannel(): Promise<TransportChannel> {
        return this.baseConnection.createChannel();
    }

    private bindToRemoteActions(): void {
        
        this.remoteBrokerService.host<{}, CreateChannelResponse>(RemoteActions.CREATE_CHANNEL, (request, responseObserver) => {
            return new Observable(observer => {
                this.log.trace('Create channel request received');
                this.createChannel()
                .then(channel => {
                    observer.next({id : channel.uuid.toString()});
                    observer.complete();
                })
                .catch(e => observer.error(e));
            }).subscribe(responseObserver);
        }, this.stringUuid);

        this.remoteBrokerService.host<ChannelRequest, ArrayBuffer>(RemoteActions.OPEN_CHANNEL, (request: ChannelRequest, responseObserver) => {
            return new Observable(observer => {
                const channel = this.getManagedChannel(request.channelId);
                this.log.trace(`Open Channel [${request.channelId}] request received`);                
                if (channel) {
                    channel.open({
                        started: () => {},
                        startFailed: e => observer.error(e),
                        next: msg => observer.next(msg),
                        complete: () => observer.complete(),
                        error: e => observer.error(e)
                    })
                } else {
                    observer.error(`No channel with id [${request.channelId}]`);
                }
            }).subscribe(responseObserver);
        }, this.stringUuid);

        

    }
}