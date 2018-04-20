

import * as net from 'net';
import * as path from 'path';

import { workspace, Disposable, ExtensionContext } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions } from 'vscode-languageclient';

export function activate(context: ExtensionContext) {
    
    const extension = process.platform == 'win32' ? '.bat' : '';
	const executable = 'interop-lang-server' + extension;
    const command = context.asAbsolutePath(path.join('interop-lang-server', 'bin', executable));
    const serverOptions = { command };
    
    const clientOptions: LanguageClientOptions = {
        documentSelector: [{scheme: 'file', language: 'interop'}],
        synchronize: {
            configurationSection: 'languageServerExample',
            fileEvents: workspace.createFileSystemWatcher('**/*.*')
        }
    }
	
	const disposable = new LanguageClient('Plexus Interop Server', serverOptions, clientOptions).start();
	
    context.subscriptions.push(disposable);
    
}