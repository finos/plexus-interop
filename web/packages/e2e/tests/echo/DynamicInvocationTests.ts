import { BaseEchoTest } from "./BaseEchoTest";
import { ConnectionProvider } from "../common/ConnectionProvider";
import { ClientsSetup } from "../common/ClientsSetup";
import { UnaryServiceHandler } from "./UnaryServiceHandler";
import * as plexus from "../../src/echo/gen/plexus-messages";

export class DynamicInvocationTests extends BaseEchoTest {

    public constructor(
        private connectionProvider: ConnectionProvider,
        private clientsSetup: ClientsSetup = new ClientsSetup()) {
        super();
    }

    public async testClientCanSendDynamicPointToPointRequest(): Promise<void> {
        const echoRequest = this.clientsSetup.createRequestDto();
        const handler = new UnaryServiceHandler(async (context, request) => request);
        const [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, handler);
        return new Promise<void>(async (resolve, reject) => {
            client.sendUnaryRequest({
                    methodId: "Unary",
                    serviceId: "plexus.interop.testing.EchoService"
                }, echoRequest, {
                    value: async (response) => {
                        this.assertEqual(echoRequest, response);
                        await this.clientsSetup.disconnect(client, server);
                        resolve();
                    },
                    error: (e) => {
                        reject(e);
                    }
                }, plexus.plexus.interop.testing.EchoRequest, plexus.plexus.interop.testing.EchoRequest); 
        });

    }

}