
import { Option } from './Option';
import * as path from 'path';

export function baseDir(): Option {
    return {
        shortName: 'b',
        longName: 'baseDir',
        exampleValue: 'metadata',
        description: 'plexus metadata base directory',
        defaultValue: process.cwd()
    };
}

export function plexusEntryPoint(): Option {
    return {
        shortName: 'i',
        longName: 'input',
        exampleValue: 'plexus_application.interop',
        description: 'file containing Plexus Component\'s entry point, e.g. rate_provider.interop'
    };
}

export function out(): Option {
    return {
        shortName: 'o',
        longName: 'output',
        exampleValue: 'src/gen',
        description: 'output directory',
        defaultValue: path.join(process.cwd(), 'gen')
    };
}

export function namespace(): Option {
    return {
        shortName: 'n',
        longName: 'namespace',
        exampleValue: 'plexus',
        description: 'generated message dtos namespace',
        defaultValue: `plexus`
    };
}