import { ApplicationConnectionDescriptor } from "./ApplicationConnectionDescriptor";
import { TransportConnection } from "@plexus-interop/transport-common";

export interface AppLifeCycleManager {

    getOnlineConnections(): Promise<ApplicationConnectionDescriptor[]>;

    spawnConnection(applicationId: string): Promise<ApplicationConnectionDescriptor>; 

    getOrSpawnConnection(applicationId: string): Promise<ApplicationConnectionDescriptor>;

    acceptConnection(connection: TransportConnection, appDescriptor: ApplicationConnectionDescriptor): Promise<void>;

}
