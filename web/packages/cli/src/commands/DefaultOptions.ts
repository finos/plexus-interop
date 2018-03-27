
import { Option } from './Option';
import * as path from 'path';

export function baseDir(): Option {
    return {
        flags: '-b, --baseDir <baseDir>',
        description: 'plexus metadata base directory',
        defaultValue: process.cwd()
    };
}

export function plexusEntryPoint(): Option {
    return {
        flags: '-i, --input <input>',
        description: 'file containing Plexus Component\'s entry point, e.g. RateProvider.interop'
    };
}

export function out(): Option {
    return {
        flags: '-o, --out <out>',
        description: 'output directory',
        defaultValue: path.join(process.cwd(), 'gen')
    };
}

export function namespace(): Option {
    return {
        flags: '-n, --namespace <namespace>',
        description: 'generated message dtos namespace',
        defaultValue: `plexus`
    };
}