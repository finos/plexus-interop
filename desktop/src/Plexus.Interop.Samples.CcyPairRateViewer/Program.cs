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
namespace Plexus.Interop.Samples.CcyPairRateViewer
{
    using Plexus.Interop.Samples.CcyPairRateViewer.Generated;
    using System;
    using System.IO;
    using System.Threading.Tasks;

    public sealed class Program
    {
        private static readonly UnaryMethod<CcyPair, CcyPairRate> GetRateMethod =
            Method.Unary<CcyPair, CcyPairRate>("fx.CcyPairRateService", "GetRate");

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
                .WithApplicationId("vendorB.fx.CcyPairRateViewer")
                .Build();

            // Connecting
            var client = ClientFactory.Instance.Create(clientOptions);
            await client.ConnectAsync();
            Console.WriteLine("Connected.");

            while (true)
            {
                Console.Write("Enter currency pair (e.g. \"EURUSD\") or press Enter to exit: ");
                var ccyPairName = Console.ReadLine();
                if (string.IsNullOrEmpty(ccyPairName))
                {
                    break;
                }
                // Requesting ccy pair rate from another app
                var request = new CcyPair {CcyPairName = ccyPairName};                
                var response = await client.Call(GetRateMethod, request);
                Console.WriteLine("Response received: " + response);
            }

            Console.WriteLine("Disconnecting.");
            await client.DisconnectAsync();
            Console.WriteLine("Disconnected.");
        }
    }
}
