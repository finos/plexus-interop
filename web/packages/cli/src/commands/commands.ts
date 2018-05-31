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
import { Command } from 'src/commands/Command';
import { GenTsCommand } from './GenTsCommand';
import { GenJsonCommand } from './GenJsonCommand';
import { GenProtoCommand } from './GenProtoCommand';
import { GenCSharpCommand } from './GenCSharpCommand';
import { ValidateMetadataCommand } from './ValidateMetadataCommand';
import { ValidateMetadataPatchCommand } from './ValidateMetadataPatchCommand';

export function commands(): Command[] {
    return [
        new GenTsCommand(), 
        new GenJsonCommand(), 
        new GenProtoCommand(), 
        new GenCSharpCommand(), 
        new ValidateMetadataCommand(),
        new ValidateMetadataPatchCommand()
    ];
}

export function printGeneralHelp(): void {
    console.log('');    
    console.log('  Help for specific command:  plexus [command] --help');
    console.log('');
}