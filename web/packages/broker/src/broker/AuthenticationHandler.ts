import { AsyncHandler } from "../Handler";
import { TransportChannel } from "@plexus-interop/transport-common";
import { ApplicationConnection } from "../lifecycle/AppConnection";
import { UniqueId, ClientProtocolHelper } from "@plexus-interop/protocol";
import { Logger, LoggerFactory } from "@plexus-interop/common";

export class AuthenticationHandler implements AsyncHandler<TransportChannel, ApplicationConnection> {

    private readonly log: Logger = LoggerFactory.getLogger("AuthenticationHandler");

    public handle(channel: TransportChannel): Promise<ApplicationConnection> {
        const channelId = channel.uuid().toString();
        return new Promise((resolve, reject) => {
            channel.open({
                started: () => {},
                startFailed: (e) => reject(e),
                next: message => {
                    if (this.log.isDebugEnabled()) {
                        this.log.debug(`[${channelId}] connect request received`);                    
                    }
                    const clientToBrokerMessage = ClientProtocolHelper.decodeConnectRequest(message);
                    if (this.log.isDebugEnabled()) {
                        this.log.debug(`Connect request from [${clientToBrokerMessage.applicationId}] application received`);                    
                    }
                    const connectionId = UniqueId.generateNew();
                    channel.sendLastMessage(ClientProtocolHelper.connectResponsePayload({connectionId}));
                    resolve({
                        id: connectionId,
                        info: {
                            id: clientToBrokerMessage.applicationId,
                            instanceId: clientToBrokerMessage.applicationInstanceId
                        }
                    });
                },
                error: e => reject(e),
                complete: () => {
                    this.log.debug(`[${channelId}] authentication channel closed`);
                }
            });
        });
    }

}