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
import { Option } from './Option';
import * as path from 'path';

export function targetBaseDir(): Option {
    return {
        shortName: 'tb',
        longName: 'targetBaseDir',
        exampleValue: 'target/folder',
        description: 'target metadata base directory',
        isRequired: true,        
        defaultValue: process.cwd()
    };
}

export function baseDir(): Option {
    return {
        shortName: 'b',
        longName: 'baseDir',
        exampleValue: 'metadata',
        description: 'plexus metadata base directory',
        isRequired: true,        
        defaultValue: process.cwd()
    };
}

export function plexusEntryPoint(): Option {
    return {
        shortName: 'i',
        longName: 'input',
        exampleValue: 'plexus_application.interop',
        isRequired: true,        
        description: 'file containing Plexus Component\'s entry point, e.g. rate_provider.interop'
    };
}

export function out(defaultValue: string = path.join(process.cwd(), 'gen')): Option {
    return {
        shortName: 'o',
        longName: 'out',
        exampleValue: 'src/gen',
        description: 'output directory',
        isRequired: true,
        defaultValue
    };
}

export function outFile(): Option {
    return {
        shortName: 'o',
        longName: 'out',
        exampleValue: 'plexus.out.log',
        description: 'output file',
        isRequired: false
    };
}

export function namespace(defaultValue: string = 'plexus'): Option {
    return {
        shortName: 'n',
        longName: 'namespace',
        exampleValue: 'plexus',
        isRequired: true,        
        description: 'namespace',
        defaultValue
    };
}

export function verbose(): Option {
    return {
        shortName: 'v',
        longName: 'verbose',
        isFlag: true,
        description: 'print verbose output'
    };
}