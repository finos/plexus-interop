import { Command } from 'src/commands/Command';
import { GenTsCommand } from './GenTsCommand';

export function commands(): Command[] {
    return [new GenTsCommand()];
}