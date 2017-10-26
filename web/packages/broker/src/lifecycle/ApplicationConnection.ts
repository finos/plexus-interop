
import { TransportConnection } from "@plexus-interop/transport-common";
import { ApplicationConnectionDescriptor } from "./ApplicationConnectionDescriptor";

export interface ApplicationConnection {
    descriptor: ApplicationConnectionDescriptor;
    connection: TransportConnection;
}