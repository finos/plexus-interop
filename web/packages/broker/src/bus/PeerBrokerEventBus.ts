import { ClientHeartBit } from "./events/ClientHeartBit";

export interface PeerBrokerEvenBus {

    sendHeartBit(clientDetails: ClientHeartBit): void;

    onClientHeartBit(listener: (clientDetails: ClientHeartBit) => void): void;

}