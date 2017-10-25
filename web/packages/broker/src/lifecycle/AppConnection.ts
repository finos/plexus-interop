import { UniqueId } from "@plexus-interop/protocol";
import { TransportConnection } from "@plexus-interop/transport-common";
import { ApplicationConnectionDescriptor } from "./ApplicationConnectionDescriptor";

export interface ApplicationConnection {
    id: UniqueId;
    info: ApplicationConnectionDescriptor;
    connection?: TransportConnection;
}