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

    public sealed class Program
    {
        private readonly Random _random = new Random();

        public static void Main(string[] args)
        {
            new Program().MainAsync(args).GetAwaiter().GetResult();
        }

        public async Task MainAsync(string[] args)
        {
            // Read broker working dir specified either in the first
            // command line argument or in environment variable, or just use current working directory
            var brokerLocation = args.Length > 0
                ? args[0]
                : Environment.GetEnvironmentVariable("PLEXUS_BROKER_WORKING_DIR") ?? Directory.GetCurrentDirectory();

            Console.WriteLine("Connecting to broker {0}.", brokerLocation);

            // Defining client options
            var clientOptions = new ClientOptionsBuilder()
                .WithDefaultConfiguration(brokerLocation)
                .WithApplicationId("vendorA.fx.CcyPairRateProvider")
                .WithProvidedService("fx.CcyPairRateService", s => 
                    s.WithUnaryMethod<CcyPair, CcyPairRate>("GetRate", GetRateAsync))
                .Build();

            // Connecting
            var client = ClientFactory.Instance.Create(clientOptions);
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

        private Task<CcyPairRate> GetRateAsync(CcyPair request, MethodCallContext context)
        {
            Console.WriteLine("Received request: {0}", request);
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
            Console.WriteLine("Sending response: {0}", response);
            return Task.FromResult(response);
        }
    }
}