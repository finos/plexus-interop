

import * as net from 'net';
import * as path from 'path';

import { workspace, Disposable, ExtensionContext } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, StreamInfo } from 'vscode-languageclient';

export function activate(context: ExtensionContext) {
    
    const clientOptions: LanguageClientOptions = {
        documentSelector: [{scheme: 'file', language: 'interop'}],
        synchronize: {
            configurationSection: 'languageServerExample',
            fileEvents: workspace.createFileSystemWatcher('**/*.*')
        }
    }
    
    let serverOptions;
    if (process.env.PLEXUS_INTEROP_LS_PORT) {
        const serverPort = process.env.PLEXUS_INTEROP_LS_PORT;
        console.error(`Connecting to LS using ${serverPort} port`);
        serverOptions = async () => {
            const socket = net.connect({
                port: serverPort
            });
            const result: StreamInfo = {
                writer: socket,
                reader: socket
            };
            return result;
        };
    } else {
        const extension = process.platform == 'win32' ? '.bat' : '';
        const executable = 'interop-lang-server' + extension;
        const command = context.asAbsolutePath(path.join('interop-lang-server', 'bin', executable));
        serverOptions = { command };
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