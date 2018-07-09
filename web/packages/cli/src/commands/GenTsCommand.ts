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
import { baseDir, out, plexusEntryPoint, namespace, verbose } from './DefaultOptions';
import { Option } from './Option';
import { getJavaExecPath, getJavaGenLibPath } from '../common/java';
import { BaseCommand } from './BaseCommand';
import { simpleSpawn } from '../common/process';
import { genJsStaticModule, genTsStaticModule } from '../common/protoJs';
import * as path from 'path';
import { removeSync, mkdirsSync, listFiles } from '../common/files';
import { GenProtoCommand } from './GenProtoCommand';

export class GenTsCommand extends BaseCommand {

    public readonly protoRegexp: RegExp = /.+\.proto$/;
    public readonly descriptorPathRegexp: RegExp = /.*google[\/\\]+protobuf[\/\\]+descriptor.proto|.*interop[\/\\]+options.proto$/;
    
    public clientGenArgs: (opts: any) => string[] = opts => {
        return ['--type=ts', ...this.optionArgs(opts)];
    }

    public name = () => 'gen-ts';

    public generalDescription = () => 'generate Typescript client and messages definitions for specified entry point';

    public options: () => Option[] = () => [baseDir(), out(), plexusEntryPoint(), namespace(), verbose()];

    public async action(opts: any): Promise<void> {
        
        this.log('Generating proto definitions');
        const protoFilesDir = path.join(opts.out, 'tmp');
        mkdirsSync(protoFilesDir);
        const protoGenCommand = new GenProtoCommand();
        await protoGenCommand.action({
            ...opts,
            out: protoFilesDir
        });

        this.log('Generating proto messages JS definitions');
        const jsFilePath =  path.join(opts.out, 'plexus-messages.js');
        const protoFiles = (await listFiles(protoFilesDir, this.protoRegexp))
            .filter(f => !this.isProtoDescriptorPath(f));
        await genJsStaticModule(jsFilePath, protoFiles, opts.namespace);

        this.log('Deleting proto definitions');
        removeSync(protoFilesDir);

        this.log('Generating proto messages TS definitions');
        const tsFileName = 'plexus-messages.d.ts';
        await genTsStaticModule(path.join(opts.out, tsFileName), jsFilePath);

        this.log('Generating interop client');
        const javaExecPath = await getJavaExecPath();
        const javaLibPath = getJavaGenLibPath();
        await simpleSpawn(javaExecPath, ['-jar', javaLibPath, ...this.clientGenArgs(opts)], opts.verbose === 'true');
        
    }

    public isProtoDescriptorPath(path: string): boolean {
        return this.descriptorPathRegexp.test(path);
    }

}
