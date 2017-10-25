import { AsyncHandler } from "../Handler";
import { TransportConnection, TransportChannel } from "@plexus-interop/transport-common";
import { Logger, LoggerFactory } from "@plexus-interop/common";
import { Completion, ErrorCompletion, SuccessCompletion } from "@plexus-interop/protocol";

export class ClientConnectionProcessor implements AsyncHandler<TransportConnection, Completion> {

    constructor(
        private readonly authenticationProcessor: AsyncHandler<TransportChannel, Completion>,
        private readonly clientRequestProcessor: AsyncHandler<TransportChannel, Completion>) {}

    private readonly log: Logger = LoggerFactory.getLogger("ClientConnectionProcessor");

    public async handle(connection: TransportConnection): Promise<Completion> {
        this.log.debug(`Received new connection ${connection.uuid().toString()}`);
        let clientConnected = false;
        return new Promise((resolve, reject) => {
            connection.open({
                next: async channel => {
                    if (!clientConnected) {

                    } else {
                                              
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