
import { UniqueId } from "@plexus-interop/transport-common";
import { ApplicationDescriptor } from "./ApplicationDescriptor";

export interface ApplicationConnectionDescriptor extends ApplicationDescriptor {
    
    connectionId: UniqueId;
    
}