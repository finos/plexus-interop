import { Command } from 'src/commands/Command';
import { GenTsCommand } from './GenTsCommand';
import { GenJsCommand } from './GenJsCommand';

export function commands(): Command[] {
    return [new GenTsCommand(), new GenJsCommand()];
}