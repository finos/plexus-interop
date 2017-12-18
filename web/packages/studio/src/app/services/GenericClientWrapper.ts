import { InteropClient } from "./InteropClient";
import { GenericClientApi, ValueHandler, InvocationClient, MethodDiscoveryRequest } from "@plexus-interop/client";
import { InvocationRequestInfo } from "@plexus-interop/protocol";
import { MethodDiscoveryResponse } from "@plexus-interop/client-api";
import { InteropRegistryService, DynamicMarshallerFactory } from "@plexus-interop/broker";
import { UnaryStringHandler } from "./UnaryStringHandler";

export class GenericClientWrapper implements InteropClient {

    public constructor(
        private readonly appId: string,
        private readonly genericClient: GenericClientApi,
        private readonly interopRegistryService: InteropRegistryService,
        private readonly encoderProvider: DynamicMarshallerFactory,
        private readonly unaryHandlers: Map<string, UnaryStringHandler>) { }

    public disconnect(): Promise<void> {
        return this.genericClient.disconnect();
    }

    public setUnaryActionHandler(serviceId: string, methodId: string, handler: (requestJson: string) => Promise<string>): void {
        this.unaryHandlers.set(`${serviceId}.${methodId}`, handler);
    }

    public async sendUnaryRequest(invocationInfo: InvocationRequestInfo, requestJson: string, responseHandler: ValueHandler<string>): Promise<InvocationClient> {
        const consumedMethod = this.interopRegistryService.getConsumedMethod(this.appId, {
            consumedService: {
                serviceId: invocationInfo.serviceId
            },
            methodId: invocationInfo.methodId
        });

        const inputMessageId = consumedMethod.method.inputMessage.id;
        const outputMessageId = consumedMethod.method.outputMessage.id;

        const requestEncoder = this.encoderProvider.getMarshaller(consumedMethod.method.inputMessage.id);
        const responseEncoder = this.encoderProvider.getMarshaller(consumedMethod.method.outputMessage.id);

        const requestData = JSON.parse(requestJson);
        requestEncoder.validate(requestData);

        return await this.genericClient.sendUnaryRequest(invocationInfo, requestEncoder.encode(requestData), {
            value: v => {
                responseHandler.value(responseEncoder.decode(v));
            },
            error: e => {
                responseHandler.error(e);
            }
        });
    }

    public discoverMethod(discoveryRequest: MethodDiscoveryRequest): Promise<MethodDiscoveryResponse> {
        return this.genericClient.discoverMethod(discoveryRequest)
    }

}