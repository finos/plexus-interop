import { Command } from 'src/commands/Command';
import { GenTsCommand } from './GenTsCommand';
import { GenJsonCommand } from './GenJsonCommand';
import { GenProtoCommand } from './GenProtoCommand';

export function commands(): Command[] {
    return [new GenTsCommand(), new GenJsonCommand(), new GenProtoCommand()];
}