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
import { JsonAppRegistryProvider } from '../../src/apps/json/JsonAppRegistryProvider';
import { Application } from '../../src/apps/model/Application';

const fs = require('fs');

describe('JsonAppRegistryProvider', () => {

    const appsJson: string = fs.readFileSync('tests/metadata/json/test-apps.json', 'utf8');    

    it('Can parse App Registry JSON', () => {

        const sut = new JsonAppRegistryProvider(appsJson);
        const appsRegistry = sut.getCurrent();

        expect(appsRegistry.apps.size).toBe(3);

        const app = appsRegistry.apps.get('plexus.interop.testing.EchoClient') as Application;

        expect(app.id).toBe('plexus.interop.testing.EchoClient');
        expect(app.displayName).toBe('Test Echo Client');
        expect(app.launcherId).toBe('plexus.interop.testing.TestAppLauncher');
        expect(app.launcherParams.url).toBe('http://test.domain.com');

    });

});