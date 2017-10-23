import { ClientHeartBit } from "./events/ClientHeartBit";


export interface PeerBrokerEvenBus {

    sendHeartBit(clientDetails: ClientHeartBit): void;

    onClientHearbit(listener: (clientDetails: ClientHeartBit) => void): void;

}