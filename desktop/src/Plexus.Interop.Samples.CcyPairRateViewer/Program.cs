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
namespace Plexus.Interop.Samples.CcyPairRateViewer
{
    using Plexus.Interop.Samples.CcyPairRateViewer.Generated;
    using System;
    using System.IO;
    using System.Threading.Tasks;

    public sealed class Program
    {
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
            var client = new CcyPairRateViewerClient(setup => setup.WithBrokerWorkingDir(brokerWorkingDir));
            await client.ConnectAsync();
            Console.WriteLine("Connected");

            while (true)
            {
                Console.Write("Enter currency pair (e.g. \"EURUSD\") or press Enter to exit: ");
                var ccyPairName = Console.ReadLine();
                if (string.IsNullOrEmpty(ccyPairName))
                {
                    break;
                }
                // Requesting ccy pair rate from another app
                var request = new CcyPair { CcyPairName = ccyPairName };
                var response = await client.CcyPairRateService.GetRate(request);
                Console.WriteLine("Response received: " + response);
            }

            Console.WriteLine("Disconnecting");
            await client.DisconnectAsync();
            Console.WriteLine("Disconnected");
        }
    }
}
