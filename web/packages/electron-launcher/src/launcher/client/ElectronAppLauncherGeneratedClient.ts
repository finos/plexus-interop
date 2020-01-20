/**
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
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
import { MethodInvocationContext, Completion, ClientConnectRequest, StreamingInvocationClient, GenericClientApi, InvocationRequestInfo, InvocationClient, GenericRequest, GenericClientApiBase } from '@plexus-interop/client';
import { ProvidedMethodReference, ServiceDiscoveryRequest, ServiceDiscoveryResponse, MethodDiscoveryRequest, MethodDiscoveryResponse, GenericClientApiBuilder, ValueHandler } from '@plexus-interop/client';
import { TransportConnection, UniqueId } from '@plexus-interop/transport-common';
import { Arrays, Observer } from '@plexus-interop/common';
import { InvocationObserver, InvocationObserverConverter, ContainerAwareClientAPIBuilder } from '@plexus-interop/client';

import * as plexus from '../gen/plexus-messages';



/**
 * Main client API
 */
export interface ElectronAppLauncherClient extends GenericClientApi  {


}

/**
 * Client's API internal implementation
 */
class ElectronAppLauncherClientImpl extends GenericClientApiBase implements ElectronAppLauncherClient {

    public constructor(
        private readonly genericClient: GenericClientApi,
    ) {
        super(genericClient);
    }


}

/**
 * Client invocation handler for AppLauncherService, to be implemented by Client
 */
export abstract class AppLauncherServiceInvocationHandler {

    public abstract onLaunch(invocationContext: MethodInvocationContext, request: plexus.interop.IAppLaunchRequest): Promise<plexus.interop.IAppLaunchResponse>;
}

/**
 * Client API builder
 */
export class ElectronAppLauncherClientBuilder {

    private clientDetails: ClientConnectRequest = {
        applicationId: 'interop.ElectronAppLauncher'
    };

    private transportConnectionProvider: () => Promise<TransportConnection>;

    private appLauncherServiceHandler: AppLauncherServiceInvocationHandler;

    public withClientDetails(clientId: ClientConnectRequest): ElectronAppLauncherClientBuilder {
        this.clientDetails = clientId;
        return this;
    }

    public withAppInstanceId(appInstanceId: UniqueId): ElectronAppLauncherClientBuilder {
        this.clientDetails.applicationInstanceId = appInstanceId;
        return this;
    }

    public withAppId(appId: string): ElectronAppLauncherClientBuilder {
        this.clientDetails.applicationId = appId;
        return this;
    }

    public withAppLauncherServiceInvocationsHandler(invocationsHandler: AppLauncherServiceInvocationHandler): ElectronAppLauncherClientBuilder {
        this.appLauncherServiceHandler = invocationsHandler;
        return this;
    }

    public withTransportConnectionProvider(provider: () => Promise<TransportConnection>): ElectronAppLauncherClientBuilder {
        this.transportConnectionProvider = provider;
        return this;
    }

    public connect(): Promise<ElectronAppLauncherClient> {
        return new ContainerAwareClientAPIBuilder()
            .withTransportConnectionProvider(this.transportConnectionProvider)
            .withClientDetails(this.clientDetails)
            .withTypeAwareUnaryHandler({
                serviceInfo: {
                    serviceId: 'interop.AppLauncherService'
                },
                methodId: 'Launch',
                handle: this.appLauncherServiceHandler.onLaunch.bind(this.appLauncherServiceHandler)
            }, plexus.interop.AppLaunchRequest, plexus.interop.AppLaunchResponse)
            .connect()
            .then((genericClient: GenericClientApi) => new ElectronAppLauncherClientImpl(
                genericClient
));
    }
}
