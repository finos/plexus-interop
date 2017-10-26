import { ApplicationConnectionDescriptor } from "./ApplicationConnectionDescriptor";
import { TransportConnection } from "@plexus-interop/transport-common";
import { ApplicationConnection } from "./ApplicationConnection";
import { ApplicationDescriptor } from "./ApplicationDescriptor";

export interface AppLifeCycleManager {

    getOnlineConnections(): Promise<ApplicationConnectionDescriptor[]>;

    spawnConnection(applicationId: string): Promise<ApplicationConnectionDescriptor>; 

    getOrSpawnConnection(applicationId: string): Promise<ApplicationConnectionDescriptor>;

    acceptConnection(connection: TransportConnection, appDescriptor: ApplicationDescriptor): Promise<ApplicationConnection>;

}
