/**
 * Copyright 2017 Plexus Interop Deutsche Bank AG
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
    using System.Threading;
    using System.Threading.Tasks;

    public class Program
    {
        public static async Task Main(string[] args)
        {
            var logging = new LoggingInitializer();
            var log = LogManager.GetLogger<Program>();
            var cancellation = new CancellationTokenSource();
            try
            {
                var brokerPath = args.Length > 0 ? args[0] : Path.GetFullPath(@"../..");
                Console.WriteLine("Connecting to broker {0}", brokerPath);
                var client = ClientFactory.Instance.Create(
                    new ClientOptionsBuilder()
                        .WithDefaultConfiguration(brokerPath)
                        .WithApplicationId("interop.samples.GreetingServer")
                        .WithProvidedService(
                            "interop.samples.GreetingService",
                            s => s
                                .WithUnaryMethod<GreetingRequest, GreetingResponse>("Unary", GreetingUnary)
                                .WithServerStreamingMethod<GreetingRequest, GreetingResponse>("ServerStreaming",
                                    GreetingServerStreaming)
                                .WithClientStreamingMethod<GreetingRequest, GreetingResponse>("ClientStreaming",
                                    GreetingClientStreaming)
                                .WithDuplexStreamingMethod<GreetingRequest, GreetingResponse>("DuplexStreaming",
                                    GreetingDuplexStreaming)
                        )
                        .Build());
                Console.CancelKeyPress += (sender, eventArgs) =>
                {
                    eventArgs.Cancel = true;
                    Console.WriteLine("Disconnecting");
                    cancellation.Cancel();
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
                logging.Dispose();
            }
            finally
            {
                cancellation.Dispose();
            }
            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();
        }

        private static Task<GreetingResponse> GreetingUnary(
            GreetingRequest request,
            MethodCallContext context)
        {
            Console.WriteLine("Received unary request from {{{0}}}", context);
            Console.WriteLine("Received: {0}", request.Name);
            var greeting = $"Hello, {request.Name}! This is .NET app.";
            Console.WriteLine("Sending response: {0}", greeting);
            return Task.FromResult(new GreetingResponse { Greeting = greeting });
        }

        private static async Task GreetingDuplexStreaming(
            IReadOnlyChannel<GreetingRequest> requestStream, 
            IWriteOnlyChannel<GreetingResponse> responseStream, 
            MethodCallContext context)
        {
            Console.WriteLine("Received duplex streaming request from {{{0}}}", context);
            var greeting = "Hello!";            
            await responseStream.WriteAsync(new GreetingResponse {Greeting = greeting}).ConfigureAwait(false);
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

        private static async Task<GreetingResponse> GreetingClientStreaming(
            IReadOnlyChannel<GreetingRequest> requeststream, 
            MethodCallContext context)
        {
            Console.WriteLine("Received client streaming request from {{{0}}}", context);
            var names = new List<string>();
            while (await requeststream.WaitReadAvailableAsync().ConfigureAwait(false))
            {
                while (requeststream.TryRead(out var request))
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

        private static async Task GreetingServerStreaming(
            GreetingRequest request, 
            IWriteOnlyChannel<GreetingResponse> responseStream,
            MethodCallContext context)
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
    }
}
