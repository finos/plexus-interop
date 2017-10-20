import { ApplicationReference } from "./ApplicationReference";
import { Application } from "../metadata/Application";

export interface AppLifeCycleManager {

    getConnectedApplications(): Promise<ApplicationReference[]>;

    launchApplication(applicationMetadata: Application): Promise<ApplicationReference>; 

    // TODO better place for heart bits?
    heartBit(applicationReference: ApplicationReference): Promise<void>;

}
