import { baseDir, out, plexusEntryPoint, namespace } from './DefaultOptions';
import { Option } from './Option';
import { getJavaExecPath, getJavaGenLibPath } from '../common/java';
import { BaseCommand } from './BaseCommand';
import { simpleSpawn } from '../common/process';
import { genJsStaticModule, genTsStaticModule } from '../common/protoJs';
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
        const jsFilePath =  path.join(opts.out, 'plexus-messages.js');
        const protoFiles = await listFiles(protoFilesDir, /.+\.proto/g);
        await genJsStaticModule(jsFilePath, protoFiles, opts.namespace);

        this.log('Deleting proto definitions');
        deleteDirectory(protoFilesDir);

        this.log('Generating proto messages TS definitions');
        const tsFileName = 'plexus-messages.d.ts';
        await genTsStaticModule(path.join(opts.out, tsFileName), jsFilePath);

        this.log('Generating interop client');
        const javaExecPath = await getJavaExecPath();
        const javaLibPath = getJavaGenLibPath();
        await simpleSpawn(javaExecPath, ['-jar', javaLibPath, ...this.clientGenArgs(opts)], opts.verbose === 'true');
        
    }

}
