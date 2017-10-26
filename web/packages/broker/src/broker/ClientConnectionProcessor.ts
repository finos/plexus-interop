import { AsyncHandler } from "../AsyncHandler";
import { TransportConnection, TransportChannel } from "@plexus-interop/transport-common";
import { Logger, LoggerFactory } from "@plexus-interop/common";
import { Completion, ErrorCompletion, SuccessCompletion } from "@plexus-interop/protocol";
import { ApplicationConnection } from "../lifecycle/ApplicationConnection";
import { AppLifeCycleManager } from "../lifecycle/AppLifeCycleManager";

export class ClientConnectionProcessor implements AsyncHandler<TransportConnection, Completion> {

    constructor(
        private readonly authenticationProcessor: AsyncHandler<TransportChannel, ApplicationConnection>,
        private readonly clientRequestProcessor: AsyncHandler<TransportChannel, Completion>,
        private readonly appLifeCycleManager: AppLifeCycleManager) {}

    private readonly log: Logger = LoggerFactory.getLogger("ClientConnectionProcessor");

    public async handle(connection: TransportConnection): Promise<Completion> {
        this.log.debug(`Received new connection ${connection.uuid().toString()}`);
        let clientConnected = false;
        return new Promise((resolve, reject) => {
            connection.open({
                next: async channel => {
                    // first channel is connectivity
                    if (!clientConnected) { 
                        try {
                            this.log.debug("Received first channel, trying to setup connection");
                            await this.authenticationProcessor.handle(channel);
                            clientConnected = true;
                        } catch (error) {
                            this.log.error("Unable to authenticate client connection");
                            reject(error);
                        }
                    } else {
                        // TODO process client request                                                
                    } 
                },
                complete: () => {
                    // TODO clean up
                    resolve(new SuccessCompletion());
                },
                error: e => {
                    // TODO clean up
                    reject(new ErrorCompletion(e));
                }
            });
        });
    }

}