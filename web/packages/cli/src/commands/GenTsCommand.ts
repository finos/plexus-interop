import { baseDir, out, plexusEntryPoint, namespace } from './DefaultOptions';
import { Option } from './Option';
// import { getJavaExecPath, getJavaGenLibPath } from '../common/java';
import { BaseCommand } from './BaseCommand';
// import { simpleSpawn } from '../common/process';
import { genJsStaticModule } from '../common/protoJs';
import * as path from 'path';
import { deleteDirectory, mkdirsSync, listFiles } from '../common/files';
import { GenProtoCommand } from './GenProtoCommand';

export class GenTsCommand extends BaseCommand {
    
    public clientGenArgs: (opts: any) => string[] = opts => {
        return ['--type=ts', ...this.optionArgs(opts)];
    }

    public name = () => 'gen-ts';

    public options: () => Option[] = () => [baseDir(), out(), plexusEntryPoint(), namespace()];

    public async action(opts: any): Promise<void> {
        
        this.log('Generating proto definitions');
        const protoFilesDir = path.join(opts.out, 'tmp');
        mkdirsSync(protoFilesDir);
        const protoGenCommand = new GenProtoCommand();
        await protoGenCommand.action({
            ...opts,
            out: protoFilesDir
        });

        this.log('Generating proto messages JS definitions');
        const verboseOutput = opts.verbose === 'true';
        const jsFileName = 'plexus-messages.js';
        const protoFiles = await listFiles(protoFilesDir, /.+\.proto/g);
        await genJsStaticModule(path.join(opts.out, jsFileName), protoFiles, opts.namespace, verboseOutput);

        this.log('Deleting proto definitions');
        deleteDirectory(protoFilesDir);

        // const javaExecPath = await getJavaExecPath();
        // const javaLibPath = getJavaGenLibPath();
        // return simpleSpawn(javaExecPath, ['-jar', javaLibPath, ...this.clientGenArgs(opts)], verboseOutput);
    }

}
