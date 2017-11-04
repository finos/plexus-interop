
import { PeerTransport } from "./PeerTransport";

export interface PeerTransportFactory {

    connect(id: string): Promise<PeerTransport>;
    
}