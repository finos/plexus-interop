
import { BaseCommand } from './BaseCommand';
import { getJavaExecPath, getJavaGenLibPath } from '../common/java';
import { simpleSpawn } from '../common/process';

export abstract class BaseJavaGenCommand extends BaseCommand {

    public abstract plexusGenArgs: (opts: any) => string[];

    public async action(opts: any): Promise<void> {
        const javaExecPath = await getJavaExecPath();
        const javaLibPath = getJavaGenLibPath();
        return simpleSpawn(javaExecPath, ['-jar', javaLibPath, ...this.plexusGenArgs(opts)], opts.verbose === 'true');
    }

}
