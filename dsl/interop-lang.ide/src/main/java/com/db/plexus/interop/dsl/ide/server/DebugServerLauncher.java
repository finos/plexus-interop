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
package com.db.plexus.interop.dsl.ide.server;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.SocketAddress;
import java.nio.channels.AsynchronousServerSocketChannel;
import java.nio.channels.AsynchronousSocketChannel;
import java.nio.channels.Channels;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.function.Function;

import org.eclipse.lsp4j.jsonrpc.Launcher;
import org.eclipse.lsp4j.jsonrpc.MessageConsumer;
import org.eclipse.lsp4j.services.LanguageClient;
import org.eclipse.xtext.ide.server.LanguageServerImpl;
import org.eclipse.xtext.ide.server.ServerModule;

import com.google.inject.Guice;
import com.google.inject.Injector;

public class DebugServerLauncher {

    public static void main(String[] args) throws InterruptedException, IOException, ExecutionException {
        final Injector injector = Guice.createInjector(new InteropLangServerModule());
        final LanguageServerImpl languageServer = injector.getInstance(InteropLanguageServer.class);
        Launcher<LanguageClient> launcher = createSocketLauncher(
                languageServer,
                LanguageClient.class,
                new InetSocketAddress("localhost", 5555),
                Executors.newCachedThreadPool(),
                consumer -> consumer);
        languageServer.connect(launcher.getRemoteProxy());
        Future<?> future = launcher.startListening();
        future.get();
    }

    static <T> Launcher<T> createSocketLauncher(Object localService, Class<T> remoteInterface, SocketAddress socketAddress, ExecutorService executorService, Function<MessageConsumer, MessageConsumer> wrapper) throws IOException, ExecutionException, InterruptedException {
        final AsynchronousServerSocketChannel serverSocket = AsynchronousServerSocketChannel.open().bind(socketAddress);
        final AsynchronousSocketChannel socketChannel = serverSocket.accept().get();
        return Launcher.createIoLauncher(
                localService,
                remoteInterface,
                Channels.newInputStream(socketChannel),
                Channels.newOutputStream(socketChannel),
                executorService,
                wrapper);
    }

}