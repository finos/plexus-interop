/**
 * Copyright 2017-2019 Plexus Interop Deutsche Bank AG
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
namespace Plexus.Interop.Samples.GreetingServer
{
    using Plexus.Channels;
    using Plexus.Interop.Samples.GreetingServer.Generated;
    using Plexus.Logging.NLog;
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Threading.Tasks;

    internal sealed class Program : GreetingServerClient.IGreetingServiceImpl
    {
        public static async Task Main(string[] args)
        {
            using (new LoggingInitializer())
            {
                var log = LogManager.GetLogger<Program>();
                try
                {
                    var brokerWorkingDir = args.Length > 0
                        ? args[0]
                        : EnvironmentHelper.GetBrokerWorkingDir() ?? Directory.GetCurrentDirectory();
                    Console.WriteLine("Connecting to broker {0}", brokerWorkingDir);
                    var client = new GreetingServerClient(new Program(), x => x.WithBrokerWorkingDir(brokerWorkingDir));
                    Console.CancelKeyPress += (sender, eventArgs) =>
                    {
                        eventArgs.Cancel = true;
                        Console.WriteLine("Disconnecting");
                        client.Disconnect();
                    };
                    await client.ConnectAsync().ConfigureAwait(false);
                    Console.WriteLine("Connected");
                    await client.Completion;
                    Console.WriteLine("Disconnected");
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Program terminated with exception. See log for details. {0}: {1}", ex.GetType(),
                        ex.Message);
                    log.Error(ex, "Program terminated with exception");
                }
            }
            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();
        }

        public Task<GreetingResponse> Unary(GreetingRequest request, MethodCallContext context)
        {
            Console.WriteLine("Received unary request from {{{0}}}", context);
            Console.WriteLine("Received: {0}", request.Name);
            var greeting = $"Hello, {request.Name}! This is .NET app.";
            Console.WriteLine("Sending response: {0}", greeting);
            return Task.FromResult(new GreetingResponse { Greeting = greeting });
        }

        public async Task ServerStreaming(GreetingRequest request, IWritableChannel<GreetingResponse> responseStream, MethodCallContext context)
        {
            Console.WriteLine("Received server streaming request from {{{0}}}", context);
            Console.WriteLine("Received: {0}", request.Name);
            var greeting = $"Hello, {request.Name}!";
            await responseStream
                .WriteAsync(new GreetingResponse { Greeting = greeting })
                .ConfigureAwait(false);
            Console.WriteLine("Sent: {0}", greeting);
            await Task.Delay(500).ConfigureAwait(false);
            greeting = $"Hello again, {request.Name}!";
            await responseStream
                .WriteAsync(new GreetingResponse { Greeting = greeting })
                .ConfigureAwait(false);
            Console.WriteLine("Sent: {0}", greeting);
            Console.WriteLine("Completed");
        }

        public async Task<GreetingResponse> ClientStreaming(IReadableChannel<GreetingRequest> requestStream, MethodCallContext context)
        {
            Console.WriteLine("Received client streaming request from {{{0}}}", context);
            var names = new List<string>();
            while (await requestStream.WaitReadAvailableAsync().ConfigureAwait(false))
            {
                while (requestStream.TryRead(out var request))
                {
                    Console.WriteLine("Received: {0}", request.Name);
                    names.Add(request.Name);
                }
            }
            Console.WriteLine("Request stream completed");
            var greeting = $"Hello, {string.Join(", ", names)}!";
            Console.WriteLine("Sending response: {0}", greeting);
            return new GreetingResponse { Greeting = greeting };
        }
        
        public async Task DuplexStreaming(IReadableChannel<GreetingRequest> requestStream, IWritableChannel<GreetingResponse> responseStream, MethodCallContext context)
        {
            Console.WriteLine("Received duplex streaming request from {{{0}}}", context);
            var greeting = "Hello!";
            await responseStream.WriteAsync(new GreetingResponse { Greeting = greeting }).ConfigureAwait(false);
            Console.WriteLine("Sent: {0}", greeting);
            while (await requestStream.WaitReadAvailableAsync().ConfigureAwait(false))
            {
                while (requestStream.TryRead(out var request))
                {
                    Console.WriteLine("Received: {0}", request.Name);
                    greeting = $"Hello, {request.Name}!";
                    await responseStream
                        .WriteAsync(new GreetingResponse { Greeting = greeting })
                        .ConfigureAwait(false);
                    Console.WriteLine("Sent: {0}", greeting);
                }
            }
            Console.WriteLine("Request stream completed");
            greeting = "Good Bye!";
            await responseStream
                .WriteAsync(new GreetingResponse { Greeting = greeting })
                .ConfigureAwait(false);
            Console.WriteLine("Sent: {0}", greeting);
            greeting = "See you again!";
            await responseStream
                .WriteAsync(new GreetingResponse { Greeting = greeting })
                .ConfigureAwait(false);
            Console.WriteLine("Sent: {0}", greeting);
            Console.WriteLine("Completed");
        }
    }
}
