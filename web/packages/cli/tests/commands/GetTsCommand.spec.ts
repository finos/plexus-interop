/*
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
import { getApprovalsBaseDir, prepareOutDir, getTestBaseDir, getTestClientInput, filesEqual } from './setup';
import * as path from 'path';
import { GenTsCommand } from '../../src/commands/GenTsCommand';

describe('Typescript Client generation CLI', () => {

    it('Generates Client and messages definitions', async () => {
        
        const testName = 'generated-ts-client';
        const genCommand = new GenTsCommand();
        const outDir = prepareOutDir(testName);
        
        await genCommand.action({
            out: outDir,
            baseDir: getTestBaseDir(),
            input: getTestClientInput(),
            namespace: 'plexus'
        });

        expect(await filesEqual(
            path.join(outDir, 'GreetingClientGeneratedClient.ts'), 
            path.join(getApprovalsBaseDir(), 'generated-ts-client.approved.txt'))).toBeTruthy();

        expect(await filesEqual(
            path.join(outDir, 'plexus-messages.js'), 
            path.join(getApprovalsBaseDir(), 'generated-ts-messages.approved.txt'))).toBeTruthy();

        expect(await filesEqual(
            path.join(outDir, 'plexus-messages.d.ts'), 
            path.join(getApprovalsBaseDir(), 'generated-ts-definitions.approved.txt'))).toBeTruthy();

    }, 15000);

    it('Handles different proto files', () => {
        const genCommand = new GenTsCommand();
        expect(genCommand.protoRegexp.test('src/authservice.proto')).toBeTruthy();
        expect(genCommand.protoRegexp.test('authservice.proto')).toBeTruthy();
        expect(genCommand.protoRegexp.test('AuthService_v1.proto')).toBeTruthy();
        expect(genCommand.protoRegexp.test('src/auth_service.proto')).toBeTruthy();
    });

});