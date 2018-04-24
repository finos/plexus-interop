package com.db.plexus.interop.dsl.ide;

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

public class DebugLanguageServer {

    public static void main(String[] args) throws InterruptedException, IOException, ExecutionException {
        final Injector injector = Guice.createInjector(new ServerModule());
        final LanguageServerImpl languageServer = injector.getInstance(LanguageServerImpl.class);
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