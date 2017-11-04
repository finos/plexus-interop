import { UniqueId, clientProtocol as plexus } from "@plexus-interop/protocol";
import { Application } from "../../src/metadata/apps/model/Application";

export interface AppLauncher {

    /**
     * Launches new application, returns instance Id
     */
    // launch(invocationContext: MethodInvocationContext, request: plexus.interop.IAppLaunchRequest): Promise<plexus.interop.IAppLaunchResponse>
}