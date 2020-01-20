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
import { baseDir, out, plexusEntryPoint, namespace, verbose } from './DefaultOptions';
import { Option } from './Option';
import { getJavaExecPath, getJavaGenLibPath } from '../common/java';
import { BaseCommand } from './BaseCommand';
import { simpleSpawn } from '../common/process';
import { getProtocExecPath } from '../common/protoc';

export class GenCSharpCommand extends BaseCommand {
    
    public clientGenArgs: (opts: any) => string[] = opts => {
        return ['--type=csharp', ...this.optionArgs(opts)];
    }

    public name = () => 'gen-csharp';

    public generalDescription = () => 'generate C# client and messages definitions for specified entry point';

    public options: () => Option[] = () => [baseDir(), out('Generated'), plexusEntryPoint(), namespace('Plexus.Interop.Testing.Generated'), verbose()];

    public async action(opts: any): Promise<void> {

        this.log('Generating interop client');
        const javaExecPath = await getJavaExecPath();
        const protocExecPath = getProtocExecPath();
        const javaLibPath = getJavaGenLibPath();
        await simpleSpawn(javaExecPath, ['-jar', javaLibPath, ...this.clientGenArgs(opts), `--protoc=${protocExecPath}`], this.isVerbose(opts));
        
    }

}
