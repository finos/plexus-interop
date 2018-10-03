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

import { DefaultConnectionDetailsService } from '@plexus-interop/client';
import { readWsUrl } from '../common/utils';
import { UrlInteropRegistryProvider } from '@plexus-interop/metadata';
import { WebSocketDataProvider } from '@plexus-interop/remote';
import { expect } from 'chai';

const wsUrl = readWsUrl();
const metadataUrl = new DefaultConnectionDetailsService().getDefaultUrl(wsUrl);

describe('WebSocket metadata loader', () => {

    it('Loads metadata from default url', async () => {
        const loader = new WebSocketDataProvider();
        const metadata = await loader.getSingleMessage(metadataUrl);
        expect(metadata).contains('applications');
    });

});

describe('URL Metadata Data loader', () => {

    it('Loads and parses metadata from Web Socket URL', async () => {
        const wsUrl = readWsUrl();        
        const urlMetadataProvider = new UrlInteropRegistryProvider(metadataUrl);
        await urlMetadataProvider.start();
        const registry = urlMetadataProvider.getCurrent();
        expect(registry.applications.valuesArray().length).to.be.greaterThan(0);
    });

});