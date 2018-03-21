import * as path from 'path';
import { BaseCommand } from './BaseCommand';

export class GenTsCommand extends BaseCommand {
    
    public name = () => 'gen-ts';

    public options = () => [
        {
            flags: '-b, --baseDir <baseDir>', 
            description: 'plexus metadata base directory', 
            defaultValue: process.cwd()
        },
        {
            flags: '-i, --input', 
            description: 'file containing Plexus Component\'s entry point, e.g. RateProvider.interop'
        },
        {
            flags: '-o, --out <out>', 
            description: 'output directory', 
            defaultValue: `${process.cwd()}${path.sep}gen`
        }
    ];

    public action(opts: any): void {
        
    }

    public usageExamples = () => ` $ plexus ${this.name()} -b ./metadata -i RateProvider.interop -o ./src/gen`
    
}
