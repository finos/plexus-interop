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
import { prepareOutDir, getTestBaseDir, getInvalidTestBaseDir } from './setup';
import * as path from 'path';
import { ListMetaFilesCommand } from '../../src/commands/ListMetaFilesCommand';
import { readTextFile } from '../../src/common/files';

describe('List metadata files CLI command', () => {

    it('Generates files based on proto file', async () => {

        const testName = 'generated-file-list-proto';
        const genCommand = new ListMetaFilesCommand();
        const outDir = prepareOutDir(testName);
        

        console.log(getInvalidTestBaseDir());
        
        await genCommand.action({
            out: outDir + '/files.json',
            baseDir: getInvalidTestBaseDir(),
            input: 'services.proto'
        });

        expect(await readTextFile(path.join(outDir, 'files.json'))).toMatch('messages');

    }, 15000);

    it('Generates files based on interop file', async () => {

        const testName = 'generated-file-list-interop';
        const genCommand = new ListMetaFilesCommand();
        const outDir = prepareOutDir(testName);
        
        await genCommand.action({
            out: outDir + '/files.json',
            baseDir: getTestBaseDir(),
            input: 'greeting_client.interop'
        });

        expect(await readTextFile(path.join(outDir, 'files.json'))).toMatch('greeting_service');

    }, 15000);

});