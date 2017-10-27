import { TransportConnection, TransportChannel, UniqueId } from "@plexus-interop/transport-common";
import { Observer } from "@plexus-interop/common";
import { clientProtocol } from "@plexus-interop/protocol"

export class PeerProxyConnection implements TransportConnection {

    // TODO

    public open(channelObserver: Observer<TransportChannel>): Promise<void> {
        throw "Not implemented";
    }

    public uuid(): UniqueId {
        throw "uuid Not implemented";
    }

    public getManagedChannels(): TransportChannel[] {
        throw "getManagedChannels Not implemented";
    }

    public disconnect(completion?: clientProtocol.ICompletion): Promise<void> {
        throw "Not implemented";
    }

    public createChannel(): Promise<TransportChannel> {
        throw "Not implemented";
    }
}