import { BaseJavaGenCommand } from './BaseJavaGenCommand';
import { baseDir, out, plexusEntryPoint } from './DefaultOptions';
import { Option } from './Option';

export class GenProtoCommand extends BaseJavaGenCommand {
    
    public plexusGenArgs: (opts: any) => string[] = opts => {
        return ['--type=proto', ...this.optionArgs(opts)];
    }

    public name = () => 'gen-proto';

    public options: () => Option[] = () => [baseDir(), out(), plexusEntryPoint()];

}
