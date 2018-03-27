import { BaseJavaGenCommand } from './BaseJavaGenCommand';
import { baseDir, out } from './DefaultOptions';
import { Option } from './Option';

export class GenJsonCommand extends BaseJavaGenCommand {
    
    public plexusGenArgs: (opts: any) => string[] = opts => {
        return ['--type=json_meta', ...this.optionArgs(opts)];
    }

    public name = () => 'gen-json-meta';

    public options: () => Option[] = () => [baseDir(), out()];

}
