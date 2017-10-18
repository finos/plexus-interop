import { BaseEchoTest } from "./BaseEchoTest";
import { ConnectionProvider } from "../common/ConnectionProvider";
import { ClientsSetup } from "../common/ClientsSetup";
import { UnaryServiceHandler } from "./UnaryServiceHandler";
import * as plexus from "../../src/echo/gen/plexus-messages";
import { ClientStreamingHandler } from "./ClientStreamingHandler";

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

    public async testClientCanSendDynamicStreamingRequest(): Promise<void> {
        const echoRequest = this.clientsSetup.createRequestDto();
        const handler = new ClientStreamingHandler((context, hostClient) => {
            return {
                next: async (clientRequest) => {
                    this.assertEqual(echoRequest, clientRequest);                    
                    hostClient.next(clientRequest);
                    hostClient.complete();
                },
                complete: () => { },
                error: (e) => { }
            };
        });
        const [client, server] = await this.clientsSetup.createEchoClients(this.connectionProvider, handler);
        return new Promise<void>(async (resolve, reject) => {
            const invocationClient = await client.sendStreamingRequest({
                methodId: "DuplexStreaming",
                serviceId: "plexus.interop.testing.EchoService"
            }, {
                next: (serverResponse) => {
                    try {
                        this.assertEqual(echoRequest, serverResponse);
                    } catch (error) {   
                        reject(error);
                    }
                },
                error: (e) => {
                    console.error("Error received by client", e);
                    reject(e);
                },
                complete: async () => {
                    await this.clientsSetup.disconnect(client, server);
                    resolve();
                }
            }, plexus.plexus.interop.testing.EchoRequest, plexus.plexus.interop.testing.EchoRequest);

            invocationClient.next(echoRequest);
            invocationClient.complete();            
        });
    }

}