import { AppLauncher } from "./AppLauncher";
import { MethodInvocationContext } from "@plexus-interop/client-api";
import { AppLaunchRequest } from "./AppLaunchRequest";
import { AppLaunchResponse } from "./AppLaunchResponse";
import { UniqueId } from "@plexus-interop/protocol";
import { Logger, LoggerFactory } from "@plexus-interop/common";

export class UrlWebAppLauncher implements AppLauncher {

    public static readonly instanceIdRequestParam: string = "plexus-instance-id";

    private readonly log: Logger = LoggerFactory.getLogger("UrlWebAppLauncher");

    public async launch(invocationContext: MethodInvocationContext, request: AppLaunchRequest): Promise<AppLaunchResponse> {
        const appInstanceId = UniqueId.generateNew();
        const url = `${request.launchParams.url}?${UrlWebAppLauncher.instanceIdRequestParam}=${appInstanceId.toString()}`;
        this.log.debug(`Launching application with [${url}] url`);
        window.open(url);
        return {
            appInstanceId
        };
    }
    
}