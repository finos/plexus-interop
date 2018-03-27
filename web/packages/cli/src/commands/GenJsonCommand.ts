import { BaseJavaGenCommand } from './BaseJavaGenCommand';
import { baseDir, out } from './DefaultOptions';
import { Option } from './Option';

export class GenJsonCommand extends BaseJavaGenCommand {
    
    public plexusGenArgs: (opts: any) => string[] = opts => {
        return ['--type=json_meta', `--baseDir=${opts.baseDir}`, `--out=${opts.out}`];
    }

    public name = () => 'gen-json-meta';

    public options: () => Option[] = () => [baseDir(), out()];

    public usageExamples = () => ` $ plexus ${this.name()} -b ./metadata -o ./src/gen`;

}
