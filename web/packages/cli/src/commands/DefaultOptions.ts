
import { Option } from './Option';
import * as path from 'path';

export function baseDir(): Option {
    return {
        shortName: 'b',
        longName: 'baseDir',
        exampleValue: 'metadata',
        description: 'plexus metadata base directory',
        isRequired: true,        
        defaultValue: process.cwd()
    };
}

export function plexusEntryPoint(): Option {
    return {
        shortName: 'i',
        longName: 'input',
        exampleValue: 'plexus_application.interop',
        isRequired: true,        
        description: 'file containing Plexus Component\'s entry point, e.g. rate_provider.interop'
    };
}

export function out(): Option {
    return {
        shortName: 'o',
        longName: 'out',
        exampleValue: 'src/gen',
        description: 'output directory',
        isRequired: true,
        defaultValue: path.join(process.cwd(), 'gen')
    };
}

export function namespace(): Option {
    return {
        shortName: 'n',
        longName: 'namespace',
        exampleValue: 'plexus',
        isRequired: true,        
        description: 'generated message dtos namespace',
        defaultValue: `plexus`
    };
}

export function verbose(): Option {
    return {
        shortName: 'v',
        longName: 'verbose',
        exampleValue: 'true',
        isRequired: true, 
        description: 'print verbose code generation output',
        defaultValue: `false`
    };
}