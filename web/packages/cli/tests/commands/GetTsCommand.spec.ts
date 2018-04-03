/*
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
import * as approvals from 'approvals';
import { getApprovalsBaseDir, prepareOutDir, getTestBaseDir, getTestClientInput } from './setup';
import { readTextFile } from '../../src/common/files';
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

        let generatedContent = await readTextFile(path.join(outDir, 'GreetingClientGeneratedClient.ts'));
        approvals.verify(getApprovalsBaseDir(), 'generated-ts-client', generatedContent);

        generatedContent = await readTextFile(path.join(outDir, 'plexus-messages.js'));
        approvals.verify(getApprovalsBaseDir(), 'generated-ts-messages', generatedContent);

        generatedContent = await readTextFile(path.join(outDir, 'plexus-messages.d.ts'));
        approvals.verify(getApprovalsBaseDir(), 'generated-ts-definitions', generatedContent);

    }, 10000);

});