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
import { ClientApiBuilder } from './ClientApiBuilder';
import { InternalGenericClientApi } from './internal';
import { UniqueId } from '@plexus-interop/protocol';
import { GenericClientApi } from './GenericClientApi';
import { GenericClientApiBuilder } from './GenericClientApiBuilder';
import { TransportConnection } from '@plexus-interop/transport-common';

export abstract class BaseClientApiBuilder<T> implements ClientApiBuilder<T> {

    public constructor(protected genericBuilder: GenericClientApiBuilder) { }

    public withAppInstanceId(appInstanceId: UniqueId): ClientApiBuilder<T> {
        this.genericBuilder = this.genericBuilder.withAppInstanceId(appInstanceId);
        return this;
    }

    public withAppId(appId: string): ClientApiBuilder<T> {
        this.genericBuilder = this.genericBuilder.withApplicationId(appId);
        return this;
    }

    public withTransportConnectionProvider(provider: () => Promise<TransportConnection>): ClientApiBuilder<T> {
        this.genericBuilder = this.genericBuilder.withTransportConnectionProvider(provider);
        return this;
    }

    public withClientApiDecorator(clientApiDecorator: (client: InternalGenericClientApi) => Promise<GenericClientApi>): ClientApiBuilder<T> {
        this.genericBuilder = this.genericBuilder.withClientApiDecorator(clientApiDecorator);
        return this;
    }

    public abstract connect(): Promise<T>;

} 