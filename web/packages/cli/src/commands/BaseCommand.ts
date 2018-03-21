import { Command } from 'src/commands/Command';
import { Option } from 'src/commands/Option';
import * as commander from 'commander';

export abstract class BaseCommand implements Command {

    public usageExamples: () => string | null = () => null;

    public options: () => Option[] = () => [];

    public name: () => string;
    
    public abstract action: (opts: any) => void;

    public register(builder: commander.CommanderStatic): void {
        let commandBuilder = builder.command(this.name());
        this.options().forEach(o => commandBuilder.option(o.flags, o.description, o.defaultValue));
        commandBuilder = commandBuilder.action(opts => this.action(opts));
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

    public exit(error: any): void {
        if (error) {
            console.error('Failed', error);
            process.exit(1);
        } else {
            console.log('Done!');
            process.exit(0);
        }
    }

}