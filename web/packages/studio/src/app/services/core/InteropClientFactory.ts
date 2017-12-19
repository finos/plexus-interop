import { UrlParamsProvider } from './UrlParamsProvider';

import { InteropClient } from "./InteropClient";
import { Injectable } from "@angular/core";
import { TransportConnectionProvider } from "./TransportConnectionProvider";
import { InteropRegistryService, ProvidedMethod, ProvidedService } from "@plexus-interop/broker";
import { GenericClientApiBuilder, MethodType } from "@plexus-interop/client";
import { UniqueId } from "@plexus-interop/protocol";
import { UnaryStringHandler } from "./UnaryStringHandler";
import { flatMap, Logger, LoggerFactory } from "@plexus-interop/common";
import { GenericClientWrapper } from "./GenericClientWrapper";
import { DynamicMarshallerFactory } from "@plexus-interop/broker";
import { DefaultMessageGenerator } from "./DefaultMessageGenerator";

@Injectable()
export class InteropClientFactory {

    private readonly log: Logger = LoggerFactory.getLogger("IntropClientFactory");

    public async connect(
        appId: string,
        interopRegistryService: InteropRegistryService,
        connectionProvider: TransportConnectionProvider): Promise<InteropClient> {

        this.log.info(`Connecting as ${appId}`);

        let genericClientBuilder = new GenericClientApiBuilder();
        let appInstanceId = UrlParamsProvider.getParam('plexusInstanceId');

        if (appInstanceId) {
            this.log.info(`Connecting with ${appInstanceId} instance ID`);
        }

        genericClientBuilder = genericClientBuilder
            .withClientDetails({
                applicationId: appId,
                applicationInstanceId: appInstanceId ? UniqueId.fromString(appInstanceId) : UniqueId.generateNew()
            })
            .withTransportConnectionProvider(connectionProvider);

        // add stub implementations for all provided actions

        const providedServices = interopRegistryService.getProvidedServices(appId);
        const unaryHandlers = new Map<string, UnaryStringHandler>();

        const marshallerFactory = new DynamicMarshallerFactory(interopRegistryService.getRegistry());
        const defaultGenerator = new DefaultMessageGenerator(interopRegistryService);

        flatMap((ps: ProvidedService) => ps.methods.valuesArray(), providedServices)
            .filter(pm => pm.method.type === MethodType.Unary)
            .forEach(pm => {
                // create dummy implementation
                const methodFullName = `${pm.providedService.service.id}.${pm.method.name}`;
                unaryHandlers.set(methodFullName, async requestJson => {
                    this.log.info(`Received request to default handler: ${requestJson}`);
                    return defaultGenerator.generate(pm.method.outputMessage.id);
                });
                genericClientBuilder.withUnaryInvocationHandler({
                    serviceInfo: {
                        serviceId: pm.providedService.service.id
                    },
                    handler: {
                        methodId: pm.method.name,
                        handle: async (invocationContext, request) => {
                            const requestMarshaller = marshallerFactory.getMarshaller(pm.method.inputMessage.id);
                            const responseMarshaller = marshallerFactory.getMarshaller(pm.method.outputMessage.id);
                            const requestObj = requestMarshaller.decode(request);
                            const stringHandler = unaryHandlers.get(methodFullName);
                            const stringResponse = await stringHandler(JSON.stringify(requestObj));
                            return responseMarshaller.encode(JSON.parse(stringResponse));
                        }
                    }
                });
            });

        const client = await genericClientBuilder.connect();

        this.log.info(`Connected as ${appId}`);

        return new GenericClientWrapper(appId, client, interopRegistryService, marshallerFactory, unaryHandlers, defaultGenerator);
    }

}