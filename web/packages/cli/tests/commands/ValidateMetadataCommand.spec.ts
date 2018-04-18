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
import { prepareOutDir, getInvalidTestBaseDir } from './setup';
import * as path from 'path';
import { ValidateMetadataCommand } from '../../src/commands/ValidateMetadataCommand';
import { readTextFile } from '../../src/common/files';

describe('Metadata Validation CLI', () => {

    it('Generates JSON with all metadata', async () => {

        const testName = 'generated-json';
        const genCommand = new ValidateMetadataCommand();
        const outDir = prepareOutDir(testName);
        const outFile = path.join(outDir, 'plexus.errors.log');
        
        try {
            await genCommand.action({
                out: outFile,
                baseDir: getInvalidTestBaseDir()
            });   
            fail('Should finish with error'); 
        } catch (error) {
            // expect to fail
        }

        const firstContent = await readTextFile(outFile);

        expect(firstContent)
            .toContain('ERROR:Couldn\'t resolve reference to Service \'com.db.plexus.interop.dsl.gen.test.services.ExampleService_NotExists\'');

    }, 15000);

});