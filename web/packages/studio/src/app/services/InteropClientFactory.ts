
import { InteropClient } from "./InteropClient";
import { Injectable } from "@angular/core";
import { TransportConnectionProvider } from "./TransportConnectionProvider";
import { InteropRegistryService, ProvidedMethod, ProvidedService } from "@plexus-interop/broker";
import { GenericClientApiBuilder, MethodType } from "@plexus-interop/client";
import { UniqueId } from "@plexus-interop/protocol";
import { UnaryStringHandler } from "./UnaryStringHandler";
import { flatMap, Logger, LoggerFactory } from "@plexus-interop/common";

@Injectable()
export class IntropClientFactory {

    private readonly log: Logger = LoggerFactory.getLogger("IntropClientFactory");

    public async connect(appId: string, 
        interopRegistryService: InteropRegistryService,
        connectionProvider: TransportConnectionProvider): Promise<InteropClient> {

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
            // unary support for first version
            .filter(pm => pm.method.type === MethodType.Unary)
            .forEach(pm => {
                // create dummy implementation
                unaryHandlers.set(`${pm.providedService.service.id}.${pm.method.name}`, async requestJson => requestJson);
                // genericClientBuilder.withUnaryInvocationHandler()
            });

        return Promise.reject("Not implemented");

    }

}