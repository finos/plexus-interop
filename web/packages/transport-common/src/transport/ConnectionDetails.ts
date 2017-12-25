import { Observer } from "@plexus-interop/common";
import { TransportChannel } from "./TransportChannel";

export interface ConnectionDetails {

    incomingChannelsObserver: Observer<TransportChannel>;
    
}