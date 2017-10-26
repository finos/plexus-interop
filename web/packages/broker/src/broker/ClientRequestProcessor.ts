import { AsyncHandler } from "../AsyncHandler";
import { TransportChannel } from "@plexus-interop/transport-common";
import { Completion, SuccessCompletion } from "@plexus-interop/protocol";

export class ClientRequestProcessor implements AsyncHandler<TransportChannel, Completion> {

    public async handle(channel: TransportChannel): Promise<Completion> {
        return new Promise((resolve, reject) => {
            channel.open({
                started: () => { },
                startFailed: () => { },
                next: message => {
                    // TODO
                },
                error: e => {
                    // TODO
                    reject(e);
                },
                complete: () => {
                    resolve(new SuccessCompletion());
                }
            });
        });
    }

}