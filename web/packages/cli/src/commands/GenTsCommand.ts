import { Command } from 'src/commands/Command';
import * as commander from 'commander';
import * as path from 'path';

export class GenTsCommand implements Command {
    
    public register(builder: commander.CommanderStatic): void {
        builder.command('gen-ts')
            .option('-b, --baseDir <baseDir>', `plexus metadata base directory`, process.cwd())
            .option('-i, --input', 'file containing Plexus Component\'s entry point, e.g. RateProvider.interop')
            .option('-o, --out <out>', `output directory`, `${process.cwd()}${path.sep}gen`)
            .action((opts) => {
                console.log(opts.baseDir);
            })
            .on('--help', () => {
                console.log('');                
                console.log('  Examples:');
                console.log('');
                console.log('    $ plexus gen-ts -b ./metadata -i RateProvider.interop -o ./src/gen');
                console.log('');
            });
    }
    
}
