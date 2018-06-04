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
import { ConnectionDetailsService } from './ConnectionDetailsService';
import { ConnectionDetails } from './ConnectionDetails';
import { Logger, LoggerFactory } from '@plexus-interop/common';

export class DefaultConnectionDetailsService implements ConnectionDetailsService {

    private readonly log: Logger = LoggerFactory.getLogger('DefaultConnectionDetailsService');
    
    public getConnectionDetails(): Promise<ConnectionDetails> {
        const globalObj = self as any;
        if (globalObj.plexus && globalObj.plexus.getConnectionDetails) {
            this.log.info('Detected connection details service, provided by container');
            return globalObj.plexus.getConnectionDetails() as Promise<ConnectionDetails>;
        } else {
            return Promise.reject('Container is not providing \'self.plexus.getConnectionDetails(): Promise<ConnectionDetails>\' API');
        }
    }

    public getMetadataUrl(): Promise<string> {
        return this.getConnectionDetails()
            .then(details => `http://localhost:${details.ws.port}/metadata/interop.json`);
    }

    
}