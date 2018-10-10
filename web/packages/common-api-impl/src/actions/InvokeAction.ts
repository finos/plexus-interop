/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { InteropRegistryService, Application } from '@plexus-interop/metadata';
import { GenericClientApi, UniqueId } from '@plexus-interop/client';
import { Method, InvokeResult } from '../api/client-api';
import { isMethod } from '../types';
import { getProvidedMethodByAlias, toConsumedMethodRef } from '../metadata';
import { GenericRequest, DiscoveryMode } from '@plexus-interop/client-api';

export class InvokeAction {

    public constructor(
        private readonly registryService: InteropRegistryService,
        private readonly genericClienApi: GenericClientApi,
        private readonly app: Application
    ) { }

    public async handle(method: string | Method, args?: any): Promise<InvokeResult> {

        const methodAlias: string = isMethod(method) ? method.name : method;
        const providedMethod = getProvidedMethodByAlias(methodAlias, this.app, this.registryService);
        const requestType = providedMethod.method.requestMessage.id;
        const responseType = providedMethod.method.responseMessage.id;

        let requestInfo: GenericRequest;

        if (isMethod(method)) {
            const discovered = await this.genericClienApi.discoverMethod({
                consumedMethod: toConsumedMethodRef(providedMethod),
                discoveryMode: DiscoveryMode.Online
            });
            const providerAppRef = this.registryService.getApplication(method.peer.applicationName);
            const methods = !!discovered.methods 
                ? discovered.methods.filter(m => {
                    const id = m.providedMethod.providedService.applicationId;
                    const connectionId = m.providedMethod.providedService.connectionId;
                    return id === providerAppRef.id 
                        && UniqueId.fromProperties(connectionId).toString() === method.peer.id;
                }) : [];
            if (methods.length > 0) {
                requestInfo = methods[0].providedMethod;
            } else {
                throw new Error(`Handler [${method.peer.id}] for action [${methodAlias}] is not found`);
            }
        } else {
            // find provided method ref and execute as consumed method
            requestInfo = {
                serviceId: providedMethod.providedService.service.id,
                methodId: providedMethod.method.name
            };
        }
        return new Promise<InvokeResult>((resolve, reject) => {
            this.genericClienApi.sendUnaryRequest(requestInfo, args, {
                value: v => resolve(v),
                error: e => reject(e)
            }, requestType, responseType);
        });
    }
}