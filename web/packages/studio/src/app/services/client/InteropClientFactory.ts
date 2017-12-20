/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { UrlParamsProvider } from '../UrlParamsProvider';
import { InteropClient } from "./InteropClient";
import { Injectable } from "@angular/core";
import { TransportConnectionProvider } from "../transport/TransportConnectionProvider";
import { InteropRegistryService, ProvidedMethod, ProvidedService } from "@plexus-interop/broker";
import { GenericClientApiBuilder, MethodType } from "@plexus-interop/client";
import { UniqueId } from "@plexus-interop/protocol";
import { UnaryStringHandler } from "./UnaryStringHandler";
import { flatMap, Logger, LoggerFactory } from "@plexus-interop/common";
import { GenericClientWrapper } from "./GenericClientWrapper";
import { DynamicMarshallerFactory } from "@plexus-interop/broker";
import { DefaultMessageGenerator } from "../DefaultMessageGenerator";

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

        const providedServices = interopRegistryService.getProvidedServices(appId);
        const unaryHandlers = new Map<string, UnaryStringHandler>();

        const marshallerFactory = new DynamicMarshallerFactory(interopRegistryService.getRegistry());
        const defaultGenerator = new DefaultMessageGenerator(interopRegistryService);

        flatMap((ps: ProvidedService) => ps.methods.valuesArray(), providedServices)
            .filter(pm => pm.method.type === MethodType.Unary)
            .forEach(pm => {
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