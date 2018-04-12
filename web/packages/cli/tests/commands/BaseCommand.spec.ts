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
import { GenJsonCommand } from '../../src/commands/GenJsonCommand';
import { BaseCommand } from '../../src/commands/BaseCommand';
import { baseDir } from '../../src/commands/DefaultOptions';

describe('BaseCommand', () => {

    it('Generates example from defined options', () => {
        const command: BaseCommand = new GenJsonCommand();
        expect(command.usageExamples()).toBe(' $ plexus gen-json-meta -b metadata -o src/gen');
    });

    it('Generates option args', () => {
        const command: BaseCommand = new GenJsonCommand();
        const args = command.optionArgs({
            baseDir: 'baseDir',
            out: 'out'
        }, '=');        
        expect(args.join(' ')).toBe('--baseDir=baseDir --out=out');
    });

    it('Fails validation if required option not provided', () => {
        const command: BaseCommand = new GenJsonCommand();
        expect(command.validateRequiredOpts([baseDir()], {}).length).toBe(1);        
    });

    it('Passes validation if required option provided', () => {
        const command: BaseCommand = new GenJsonCommand();
        expect(command.validateRequiredOpts([baseDir()], {
            baseDir: 'value'
        }).length).toBe(0);        
    });

});