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
 namespace Plexus.Interop.Samples.GreetingClient
{
    using Plexus.Interop.Samples.GreetingClient.Generated;
    using System;
    using System.IO;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;
    using Plexus.Channels;
    using Plexus.Logging.NLog;

    public sealed class Program
    {        
        public static async Task Main(string[] args)
        {
            var logging = new LoggingInitializer();
            var log = LogManager.GetLogger<Program>();
            var cancellation = new CancellationTokenSource();
            try
            {
                var brokerPath = args.Length > 0 ? args[0] : Path.GetFullPath(@"../..");
                Console.WriteLine("Connecting to {0}", brokerPath);
                var client = ClientFactory.Instance.Create(
                    new ClientOptionsBuilder()
                        .WithDefaultConfiguration(brokerPath)
                        .WithCancellationToken(cancellation.Token)
                        .WithApplicationId("interop.samples.GreetingClient")
                        .Build());

                await client.ConnectAsync();
                Console.WriteLine("Connected");

                var nextCase = true;
                while (nextCase)
                {
                    Console.WriteLine(
                        "> Select next example:\n" +
                        "> '1': Unary Call\n" +
                        "> '2': Server Streaming Call\n" +
                        "> '3': Client Streaming Call\n" +
                        "> '4': Duplex Streaming Call\n" +
                        "> '5': Discovery\n" +
                        "> '0': Disconnect");
                    var c = Console.ReadLine();
                    switch (c)
                    {
                        case "1":
                            await UnaryRequestExampleAsync(client);
                            break;
                        case "2":
                            await ServerStreamingRequestExampleAsync(client);
                            break;
                        case "3":
                            await ClientStreamingRequestExampleAsync(client);
                            break;
                        case "4":
                            await DuplexStreamingRequestExampleAsync(client);
                            break;
                        case "5":
                            await DiscoveryExampleAsync(client);
                            break;
                        case "0":
                            nextCase = false;
                            break;
                        default:
                            Console.WriteLine("Unknown command: {0}", c);
                            break;
                    }
                }
                Console.WriteLine("Disconnecting");
                cancellation.Cancel();
                await client.Completion;
                Console.WriteLine("Disconnected");
            }
            catch (Exception ex)
            {
                Console.WriteLine("Program terminated with exception. See log for details. {0}: {1}", ex.GetType(), ex.Message);
                log.Error(ex, "Program terminated with exception");                
            }
            finally
            {
                cancellation.Dispose();
                logging.Dispose();                
            }
            Console.WriteLine("> Press any key to exit...");
            Console.ReadKey();
        }

        public static Task UnaryRequestExampleAsync(IClient client)
        {
            var unaryMethod = Method.Unary<GreetingRequest, GreetingResponse>("interop.samples.GreetingService", "Unary");
            return UnaryRequestExampleAsync(client, unaryMethod);
        }

        private static async Task UnaryRequestExampleAsync(IClient client, IUnaryMethod<GreetingRequest, GreetingResponse> unaryMethod)
        {
            Console.Write("> Enter name to send: ");
            var name = Console.ReadLine();
            var request = new GreetingRequest { Name = name };
            Console.WriteLine("Sending: {0}", name);
            var response = await client.Call(unaryMethod, request);
            Console.WriteLine("Received: {0}", response.Greeting);
        }

        public static async Task ServerStreamingRequestExampleAsync(IClient client)
        {
            var serverStreaming = Method.ServerStreaming<GreetingRequest, GreetingResponse>("interop.samples.GreetingService", "ServerStreaming");
            Console.Write("> Enter name to send: ");
            var name = Console.ReadLine();
            var request = new GreetingRequest { Name = name };
            Console.WriteLine("Sending: {0}", name);
            var responseStream = client.Call(serverStreaming, request).ResponseStream;
            while (await responseStream.WaitReadAvailableAsync())
            {
                while (responseStream.TryRead(out var response))
                {
                    Console.WriteLine("Received: {0}", response.Greeting);                    
                }
            }
            Console.WriteLine("Server stream completed");
        }

        public static async Task ClientStreamingRequestExampleAsync(IClient client)
        {
            Console.WriteLine("Calling client streaming");
            var clientStreaming = Method.ClientStreaming<GreetingRequest, GreetingResponse>("interop.samples.GreetingService", "ClientStreaming");
            var call = client.Call(clientStreaming);
            var requestStream = call.RequestStream;
            while (true)
            {
                Console.Write("> Enter next name to send\n> or empty line to complete request stream: ");
                var name = Console.ReadLine();
                if (string.IsNullOrEmpty(name))
                {
                    break;
                }
                var request = new GreetingRequest {Name = name};
                Console.WriteLine("Sending: {0}", name);
                await requestStream.WriteAsync(request);
            }
            Console.WriteLine("Completing request stream");
            requestStream.TryCompleteWriting();
            var response = await call.ResponseAsync;
            Console.WriteLine("Received response: {0}", response.Greeting);
        }

        public static async Task DuplexStreamingRequestExampleAsync(IClient client)
        {
            Console.WriteLine("Calling duplex streaming");
            var duplexStreaming = Method.DuplexStreaming<GreetingRequest, GreetingResponse>("interop.samples.GreetingService", "DuplexStreaming");
            var call = client.Call(duplexStreaming);
            var requestStream = call.RequestStream;
            var responseStream = call.ResponseStream;
            var response = await responseStream.ReadAsync();
            Console.WriteLine("Received: {0}", response.Greeting);
            while (true)
            {
                Console.Write("> Enter next name to send\n> or empty line to complete request stream: ");
                var name = Console.ReadLine();
                if (string.IsNullOrEmpty(name))
                {
                    break;
                }
                var request = new GreetingRequest { Name = name };
                Console.WriteLine("Sending: {0}", name);
                await requestStream.WriteAsync(request);
                response = await responseStream.ReadAsync();
                Console.WriteLine("Received: {0}", response.Greeting);                
            }
            Console.WriteLine("Completing request stream");
            requestStream.TryCompleteWriting();
            while (await responseStream.WaitReadAvailableAsync())
            {
                while (responseStream.TryRead(out response))
                {
                    Console.WriteLine("Received: {0}", response.Greeting);
                }
            }
            Console.WriteLine("Response stream completed");
        }

        public static async Task DiscoveryExampleAsync(IClient client)
        {            
            var greetingMethod =
                Method.Unary<GreetingRequest, GreetingResponse>("interop.samples.GreetingService", "Unary");
            Console.WriteLine("Calling discovery for method {0}", greetingMethod);
            var discoveredProviders = (await client.DiscoverAsync(greetingMethod)).ToArray();
            Console.WriteLine("Discovered {0} actions:", discoveredProviders.Length);
            for (var i=0; i<discoveredProviders.Length; i++)
            {                       
                Console.WriteLine("  {0}: {1} ({2})", i, discoveredProviders[i].Title, discoveredProviders[i].ProvidedMethod.ProvidedService.ApplicationId);
            }            
            while (true)
            {
                Console.WriteLine("> Please choose which one to invoke\n> or empty line to skip invocation: ");
                var s = Console.ReadLine();
                if (string.IsNullOrEmpty(s))
                {
                    break;
                }
                if (!int.TryParse(s, out var index) || index < 0 || index > discoveredProviders.Length)
                {
                    Console.WriteLine("Invalid input. Please try again.");
                }
                var provider = discoveredProviders[index];
                Console.WriteLine("Invoking {0} ({1})", provider.Title, provider.ProvidedMethod.ProvidedService.ApplicationId);
                await UnaryRequestExampleAsync(client, provider);
                break;
            }
        }
    }
}
