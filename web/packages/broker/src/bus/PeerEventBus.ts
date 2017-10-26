import { ApplicationConnectionDescriptor } from "../lifecycle/ApplicationConnectionDescriptor";

export interface PeerEventBus {

    sendHeartBit(clientDetails: ApplicationConnectionDescriptor): void;

    onConnectionHeartBit(listener: (clientDetails: ApplicationConnectionDescriptor) => void): void;

}