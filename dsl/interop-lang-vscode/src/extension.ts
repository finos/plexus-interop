/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
            process.env.PLEXUS_INTEROP_LS_PORT,
            context,
            interopClientOptions);
    
    context.subscriptions.push(interopClient.start());

    const protoClientOptions: LanguageClientOptions = {
        documentSelector: [
            {scheme: 'file', language: 'proto'}
        ]
    };
    
    if (!!process.env.PROTO_LANG_DEBUG_STDIO) {
        process.env['PROTO_LANG_SERVER_OPTS'] = '-Xdebug -Xrunjdwp:server=y,transport=dt_socket,address=9999,suspend=n,quiet=y';
    }

    const protoClient = createLangClient(
        'proto-lang-server', 
        process.env.PLEXUS_PROTO_LS_PORT,
        context,
        protoClientOptions);

    context.subscriptions.push(protoClient.start());
    
}

function createLangClient(
        title: string, 
        serverPort: string, 
        context: ExtensionContext, 
        clientOptions: LanguageClientOptions) {

    let serverOptions;
    if (serverPort) {
        console.error(`Connecting to ${title} using ${serverPort} port`);
        serverOptions = async () => {
            const socket = net.connect({
                port: Number.parseInt(serverPort)
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