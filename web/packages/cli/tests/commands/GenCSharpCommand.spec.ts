/*
 * Copyright 2018 Plexus Interop Deutsche Bank AG
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
import { prepareOutDir, getTestBaseDir, getTestClientInput, getApprovalsBaseDir, filesEqual } from './setup';
import * as path from 'path';
import { GenCSharpCommand } from '../../src/commands/GenCSharpCommand';

describe('C# Client generation CLI', () => {

    it('Generates C# client and messages definitions', async () => {
        
        const testName = 'generated-cs-client';
        const genCommand = new GenCSharpCommand();
        const outDir = prepareOutDir(testName);
        
        await genCommand.action({
            out: outDir,
            baseDir: getTestBaseDir(),
            input: getTestClientInput(),
            namespace: 'plexus'
        });

        expect(await filesEqual(
            path.join(outDir, 'interop/samples/GreetingClient.app.g.cs'), 
            path.join(getApprovalsBaseDir(), 'generated-cs-client.approved.txt'))).toBeTruthy();

        expect(await filesEqual(
            path.join(outDir, 'interop/samples/GreetingService.msg.g.cs'), 
            path.join(getApprovalsBaseDir(), 'generated-cs-messages.approved.txt'))).toBeTruthy();

        expect(await filesEqual(
            path.join(outDir, 'interop/samples/GreetingService.svc.g.cs'), 
            path.join(getApprovalsBaseDir(), 'generated-cs-service.approved.txt'))).toBeTruthy();

        expect(await filesEqual(
            path.join(outDir, 'interop/Options.msg.g.cs'), 
            path.join(getApprovalsBaseDir(), 'generated-cs-options.approved.txt'))).toBeTruthy();

    }, 15000);

});