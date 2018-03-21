
import * as program from 'commander';
import { commands } from './commands';

export function main(args: string[], version: string): void {
    commands().forEach(c => c.register(program));
    program
        .version(version)
        .parse(args);
}