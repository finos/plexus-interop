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
namespace Plexus.Interop.Samples.CcyPairRateProvider
{
    using Plexus.Interop.Samples.CcyPairRateProvider.Generated;
    using System;
    using System.IO;
    using System.Threading.Tasks;
    using Plexus.Channels;

    public sealed class Program : CcyPairRateProviderClient.ICcyPairRateServiceImpl
    {
        private readonly Random _random = new Random();

        public static void Main(string[] args)
        {
            new Program().MainAsync(args).GetAwaiter().GetResult();
        }

        public async Task MainAsync(string[] args)
        {
            // Read broker working dir specified either in the first
            // command line argument or in environment variable, 
            // or just use current working directory.
            var brokerWorkingDir = args.Length > 0
                ? args[0]
                : EnvironmentHelper.GetBrokerWorkingDir() ?? Directory.GetCurrentDirectory();

            // Creating client and connecting to broker
            Console.WriteLine("Connecting to broker {0}", brokerWorkingDir);
            var client = new CcyPairRateProviderClient(this, setup => setup.WithBrokerWorkingDir(brokerWorkingDir));            
            await client.ConnectAsync();
            Console.WriteLine("Connected. Waiting for requests. Press CTRL+C to disconnect.");
            Console.CancelKeyPress += (sender, eventArgs) =>
            {
                eventArgs.Cancel = true;
                client.Disconnect();
            };

            // Awaiting completion
            await client.Completion;
            Console.WriteLine("Disconnected.");
        }


        // Implementation of unary method GetRate
        public Task<CcyPairRate> GetRate(CcyPair request, MethodCallContext context)
        {
            Console.WriteLine("Received request: {0}", request);
            var response = GetCcyPairRate(request);
            Console.WriteLine("Sending response: {0}", response);
            return Task.FromResult(response);
        }

        // Implementation of server streaming method GetRateStream
        public async Task GetRateStream(
            CcyPair request,
            IWritableChannel<CcyPairRate> responseStream,
            MethodCallContext context)
        {
            Console.WriteLine("Received subscription: {0}", request);
            try
            {
                do
                {
                    var response = GetCcyPairRate(request);
                    Console.WriteLine("Sending response: {0}", response);
                    await responseStream.TryWriteAsync(response, context.CancellationToken);
                    await Task.Delay(_random.Next(1000, 3000), context.CancellationToken);
                } while (!context.CancellationToken.IsCancellationRequested);
            }
            catch (OperationCanceledException) when (context.CancellationToken.IsCancellationRequested)
            {
                // Ignoring cancellation exception
            }
            Console.WriteLine("Subscription completed");
        }

        private CcyPairRate GetCcyPairRate(CcyPair request)
        {
            CcyPairRate response;
            switch (request.CcyPairName)
            {
                case "EURUSD":
                    response = new CcyPairRate
                    {
                        CcyPairName = "EURUSD",
                        Rate = 1.15 + 0.05 * _random.NextDouble()
                    };
                    break;
                case "EURGBP":
                    response = new CcyPairRate
                    {
                        CcyPairName = "EURGBP",
                        Rate = 0.87 + 0.05 * _random.NextDouble()
                    };
                    break;
                default:
                    throw new ArgumentOutOfRangeException($"Unknown currency pair: {request.CcyPairName}");
            }

            return response;
        }
    }
}