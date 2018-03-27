import { Command } from './Command';
import { Option, getFlags } from './Option';
import * as commander from 'commander';

export abstract class BaseCommand implements Command {

    public abstract name: () => string;
    
    public abstract action(opts: any): Promise<void>;

    public usageExamples = () => ` $ plexus ${this.name()} ${this.optionsExampleArgs().join(' ')}`;

    public options: () => Option[] = () => [];

    public optionArgs = (optValues: any, separator?: string): string[] => {
        return this.options().reduce<string[]>((seed, option) => {
            const name = `--${option.longName}`;
            const value = optValues[option.longName];
            const optionArgs = !!separator ? [`${name}=${value}`] : [name, value];
            return seed.concat(optionArgs);
        }, []);
    }

    public optionsExampleArgs = () => {
        return this.options().reduce<string[]>((seed, option) => {
            return seed.concat([`-${option.shortName}`, option.exampleValue]);
        }, []);
    }

    public log(msg: string, ...args: any[]): void {
        console.log(`[${this.name()}] ${msg}`, args);
    }

    public register(builder: commander.CommanderStatic): void {
        let commandBuilder = builder.command(this.name());
        this.options().forEach(o => commandBuilder.option(getFlags(o), o.description, o.defaultValue));
        commandBuilder = commandBuilder.action(opts => {
            // need to do it manually :(
            // https://github.com/tj/commander.js/issues/44
            this.log('Validating input args');            
            this.validateRequiredOpts(opts);
            this.log('Starting execution');
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
        this.log('Failed to execute', error);
        process.exit(1);
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
                    this.fail(`'${o.flags}' option is not defined`);
                }
            });
        }
    }

}