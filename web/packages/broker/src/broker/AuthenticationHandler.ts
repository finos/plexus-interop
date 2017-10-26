import { AsyncHandler } from "../AsyncHandler";
import { TransportChannel, TransportConnection } from "@plexus-interop/transport-common";
import { ApplicationConnection } from "../lifecycle/ApplicationConnection";
import { UniqueId, ClientProtocolHelper } from "@plexus-interop/protocol";
import { Logger, LoggerFactory } from "@plexus-interop/common";
import { AppLifeCycleManager } from "../lifecycle/AppLifeCycleManager";
import { transportProtocol as plexus } from "@plexus-interop/protocol";

export class AuthenticationHandler implements AsyncHandler<[TransportConnection, TransportChannel], ApplicationConnection> {

    private readonly log: Logger = LoggerFactory.getLogger("AuthenticationHandler");

    constructor(private readonly appLifeCycleManager: AppLifeCycleManager) { }

    public handle(connectionDetails: [TransportConnection, TransportChannel]): Promise<ApplicationConnection> {

        const [connection, channel] = connectionDetails;
        const channelId = channel.uuid().toString();

        return new Promise((resolve, reject) => {
            channel.open({
                started: () => { },
                startFailed: (e) => reject(e),
                next: async message => {

                    if (this.log.isDebugEnabled()) {
                        this.log.debug(`[${channelId}] connect request received`);
                    }

                    const clientToBrokerMessage = ClientProtocolHelper.decodeConnectRequest(message);
                    
                    if (this.log.isDebugEnabled()) {
                        this.log.debug(`Connect request from [${clientToBrokerMessage.applicationId}] application received`);
                    }

                    const appConnection = await this.appLifeCycleManager.acceptConnection(connection, {
                        applicationId: clientToBrokerMessage.applicationId as string,
                        instanceId: UniqueId.fromProperties(clientToBrokerMessage.applicationInstanceId as plexus.IUniqueId)
                    });

                    channel.sendLastMessage(ClientProtocolHelper.connectResponsePayload({ connectionId: appConnection.descriptor.connectionId }))
                        .catch(e => this.log.error("Failed to sent connection details", e));

                    resolve(appConnection);
                },
                error: e => reject(e),
                complete: () => {
                    this.log.debug(`[${channelId}] authentication channel closed`);
                }
            });
        });
    }

}