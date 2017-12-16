
import { InteropClient } from "./InteropClient";
import { Injectable } from "@angular/core";
import { TransportConnectionProvider } from "./TransportConnectionProvider";
import { InteropRegistryService, ProvidedMethod, ProvidedService } from "@plexus-interop/broker";
import { GenericClientApiBuilder, MethodType } from "@plexus-interop/client";
import { UniqueId } from "@plexus-interop/protocol";
import { UnaryStringHandler } from "./UnaryStringHandler";
import { flatMap, Logger, LoggerFactory } from "@plexus-interop/common";
import { EncoderProvider } from "./EncoderProvider";
import { GenericClientWrapper } from "./GenericClientWrapper";

@Injectable()
export class IntropClientFactory {

    private readonly log: Logger = LoggerFactory.getLogger("IntropClientFactory");

    private readonly encoderProvider: EncoderProvider = new EncoderProvider();

    public async connect(
        appId: string,
        interopRegistryService: InteropRegistryService,
        connectionProvider: TransportConnectionProvider): Promise<InteropClient> {

        this.log.info(`Connecting as ${appId}`);

        let genericClientBuilder = new GenericClientApiBuilder();

        genericClientBuilder = genericClientBuilder
            .withClientDetails({
                applicationId: appId,
                applicationInstanceId: UniqueId.generateNew()
            })
            .withTransportConnectionProvider(connectionProvider);

        // add stub implementations for all provided actions

        const providedServices = interopRegistryService.getProvidedServices(appId);
        const unaryHandlers = new Map<string, UnaryStringHandler>();

        flatMap((ps: ProvidedService) => ps.methods.valuesArray(), providedServices)
            .filter(pm => pm.method.type === MethodType.Unary)
            .forEach(pm => {
                // create dummy implementation
                const methodFullName = `${pm.providedService.service.id}.${pm.method.name}`;
                unaryHandlers.set(methodFullName, async requestJson => requestJson);
                genericClientBuilder.withUnaryInvocationHandler({
                    serviceInfo: {
                        serviceId: pm.providedService.service.id
                    },
                    handler: {
                        methodId: pm.method.name,
                        handle: async (invocationContext, request) => {
                            const requestEncoder = this.encoderProvider.getMessageEncoder(pm.method.inputMessage.id);
                            const resposeEncoder = this.encoderProvider.getMessageEncoder(pm.method.outputMessage.id);
                            const requestJson = requestEncoder.decode(request);
                            const stringHandler = unaryHandlers.get(methodFullName);
                            const stringResponse = await stringHandler(requestJson);
                            return requestEncoder.encode(stringResponse);
                        }
                    }
                });
            });

        const client = await genericClientBuilder.connect();

        this.log.info(`Connected as ${appId}`);

        return new GenericClientWrapper(appId, client, interopRegistryService, this.encoderProvider, unaryHandlers);
    }

}