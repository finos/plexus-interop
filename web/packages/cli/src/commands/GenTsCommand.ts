import { Command } from 'src/commands/Command';
import * as commander from 'commander';

export class GenTsCommand implements Command {
    
    public register(builder: commander.CommanderStatic): void {
        builder.command('gen-ts');
    }
}
