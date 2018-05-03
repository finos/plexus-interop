

import * as net from 'net';
import * as path from 'path';

import { workspace, Disposable, ExtensionContext } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, StreamInfo } from 'vscode-languageclient';

export function activate(context: ExtensionContext) {
    
    const interopClientOptions: LanguageClientOptions = {
        documentSelector: [
            {scheme: 'file', language: 'interop'}
        ]
    };
    
    const interopClient = createLangClient(
            'interop-lang-server', 
            'PLEXUS_INTEROP_LS_PORT',
            context,
            interopClientOptions);
    
    context.subscriptions.push(interopClient.start());


    const protoClientOptions: LanguageClientOptions = {
        documentSelector: [
            {scheme: 'file', language: 'proto'}
        ]
    };
    
    const protoClient = createLangClient(
        'proto-lang-server', 
        'PLEXUS_PROTO_LS_PORT',
        context,
        protoClientOptions);

    context.subscriptions.push(protoClient.start());
    
}

function createLangClient(
        title: string, 
        debugPortEnv: string, 
        context: ExtensionContext, 
        clientOptions: LanguageClientOptions) {

    let serverOptions;
    if (process.env[debugPortEnv]) {
        const serverPort = process.env[debugPortEnv];
        console.error(`Connecting to ${title} using ${serverPort} port`);
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
        const executable = title + extension;
        const command = context.asAbsolutePath(path.join(title, 'bin', executable));
        serverOptions = { command };
    }   
    
    return new LanguageClient(title, serverOptions, clientOptions);
}

function isDebugMode(): boolean {
	let args = (process as any).execArgv;
	if (args) {
		return args.some((arg) => /^--debug=?/.test(arg) || /^--debug-brk=?/.test(arg) || /^--inspect-brk=?/.test(arg));
	}
	return false;
}