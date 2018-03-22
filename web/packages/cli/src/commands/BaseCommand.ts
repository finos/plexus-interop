import { Command } from 'src/commands/Command';
import { Option } from 'src/commands/Option';
import * as commander from 'commander';

export abstract class BaseCommand implements Command {

    public abstract name: () => string;
    
    public abstract action(opts: any): void;

    public usageExamples: () => string | null = () => null;

    public options: () => Option[] = () => [];

    public register(builder: commander.CommanderStatic): void {
        let commandBuilder = builder.command(this.name());
        this.options().forEach(o => commandBuilder.option(o.flags, o.description, o.defaultValue));
        commandBuilder = commandBuilder.action(opts => {
            // need to do it manually :(
            // https://github.com/tj/commander.js/issues/44
            this.validateRequiredOpts(opts);
            this.action(opts);
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
    
    public exit(error: any): void {
        if (error) {
            console.error('error: ', error);
            process.exit(1);
        } else {
            console.log('Done!');
            process.exit(0);
        }
    }

    public log(msg: string, args?: any[]): void {
        console.log(msg, args);
    }

    private validateRequiredOpts(opts: any): void {
        const options: any[] = opts.options;
        if (options) {
            options
            .filter(o => o.flags.indexOf('<') !== -1)    
            .forEach(o => {
                const flags = o.flags;
                const optName = flags.substring(flags.lastIndexOf('<') + 1, flags.lastIndexOf('>'));
                if (opts[optName] === undefined) {
                    this.exit(`'${o.flags}' option is not defined`);
                }
            });
        }
    }

}