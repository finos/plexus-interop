

import * as net from 'net';
import * as path from 'path';

import { workspace, Disposable, ExtensionContext } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions } from 'vscode-languageclient';

export function activate(context: ExtensionContext) {
    
    const extension = process.platform == 'win32' ? '.bat' : '';
	const executable = 'interop-lang-server' + extension;
    const command = context.asAbsolutePath(path.join('interop-lang-server', 'bin', executable));
    const serverOptions = { command };

    if (isDebugMode()) {
        console.error('Extension is running in debug mode');
    }
    
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

function isDebugMode(): boolean {
	let args = (process as any).execArgv;
	if (args) {
		return args.some((arg) => /^--debug=?/.test(arg) || /^--debug-brk=?/.test(arg) || /^--inspect-brk=?/.test(arg));
	}
	return false;
}