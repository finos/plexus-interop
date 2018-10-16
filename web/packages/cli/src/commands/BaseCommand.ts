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
import { Command } from './Command';
import { Option, getFlags } from './Option';
import * as commander from 'commander';

export abstract class BaseCommand implements Command {

    public abstract name: () => string;

    public abstract action(opts: any): Promise<void>;

    public usageExamples = () => ` $ plexus ${this.name()} ${this.optionsExampleArgs().join(' ')}`;

    public generalDescription = () => '';

    public options: () => Option[] = () => [];

    public optionArgs = (
        optValues: any,
        separator?: string,
        nameConverter: (k: string) => string = k => k): string[] => {
        return this.options().reduce<string[]>((seed, option) => {
            const value = optValues[option.longName];
            if (!value) {
                return seed;
            }
            const name = `--${nameConverter(option.longName)}`;
            if (option.isFlag) {
                return seed.concat(`${name}`);
            } else {
                const optionArgs = !!separator ? [`${name}${separator}${value}`] : [name, value];
                return seed.concat(optionArgs);
            }
        }, []);
    }

    public optionsExampleArgs = () => {
        return this.options()
            .filter(o => o.exampleValue || o.isFlag)
            .reduce<string[]>((seed, option) => {
                if (option.isFlag) {
                    return seed.concat(`-${option.shortName}`);
                } else {
                    return seed.concat([`-${option.shortName}`, option.exampleValue as string]);
                }
            }, []);
    }

    public isVerbose(opts: any): boolean {
        return !!opts && !!opts.verbose && opts.verbose !== 'false';
    }

    public log(msg: string, ...args: any[]): void {
        console.log(`[${this.name()}] ${msg}`, args);
    }

    public register(builder: commander.CommanderStatic): void {
        let commandBuilder = builder.command(this.name())
            .description(this.generalDescription());
        this.options().forEach(o => commandBuilder.option(getFlags(o), o.description, o.defaultValue));
        commandBuilder = commandBuilder.action(opts => {
            // need to do it manually :(
            // https://github.com/tj/commander.js/issues/44
            this.log('Validating input args');
            const errors = this.validateRequiredOpts(this.options(), opts);
            if (errors.length > 0) {
                this.fail(errors.join('\n'));
            }
            this.log('Starting execution');
            if (opts.verbose === 'true') {
                this.log(`Passed options: ${this.optionValuesToString(opts)}`);
            }
            this.action(opts)
                .then(() => this.log('Completed successfully'))
                .catch(e => this.fail(e));
        });
        const examples = this.usageExamples();
        if (examples) {
            commandBuilder.on('--help', () => {
                console.log('');
                console.log('  Examples:');
                console.log('');
                console.log(examples);
                console.log('');
            });
        }
    }

    public fail(error: any): void {
        this.log('Finished with error', error);
        process.exit(1);
    }

    public optionValuesToString(opts: any): string {
        return this.options().reduce<string>((seed, option) => `${seed} ${option.longName}=${opts[option.longName]}`, '');
    }

    public validateRequiredOpts(options: Option[], commanderOpts: any): string[] {
        if (options) {
            return options
                .filter(o => !!o.isRequired && !commanderOpts[o.longName])
                .map(o => `'${getFlags(o)}' option is required`);
        } else {
            return [];
        }
    }

}