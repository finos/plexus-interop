import { BaseJavaGenCommand } from './BaseJavaGenCommand';
import { baseDir, out } from './DefaultOptions';
import { Option } from './Option';

export class GenTsCommand extends BaseJavaGenCommand {
    
    public plexusGenArgs: (opts: any) => string[] = opts => {
        return ['--type=ts', ...this.optionArgs(opts)];
    }

    public name = () => 'gen-ts';

    public options: () => Option[] = () => [baseDir(), out()];

}
