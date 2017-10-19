import { TransportConnection } from "@plexus-interop/transport-common";

export interface ConnectionSetup {

    getConnection(): TransportConnection;
    
    dropConnection(): void;
    
}