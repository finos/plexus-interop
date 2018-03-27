import { BaseJavaGenCommand } from './BaseJavaGenCommand';
import { baseDir, plexusEntryPoint, out, namespace } from './DefaultOptions';
import { Option } from './Option';

export class GenTsCommand extends BaseJavaGenCommand {
    
    public plexusGenArgs: (opts: any) => string[] = opts => {
        return ['--type=ts'];
    }

    public name = () => 'gen-ts';

    public options: () => Option[] = () => [baseDir(), plexusEntryPoint(), out(), namespace()];

    public usageExamples = () => ` $ plexus ${this.name()} -b ./metadata -i RateProvider.interop -o ./src/gen`;

}
