/**
 * Copyright 2017-2021 Plexus Interop Deutsche Bank AG
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
namespace Plexus.Interop.Internal
{
    using Plexus.Interop.Apps;
    using Plexus.Interop.Broker;
    using Plexus.Interop.Metamodel;
    using Plexus.Interop.Metamodel.Json;
    using Plexus.Interop.Protocol.Protobuf;
    using Plexus.Interop.Transport;
    using Plexus.Interop.Transport.Protocol.Protobuf;
    using Plexus.Interop.Transport.Transmission.Pipes;
    using Plexus.Interop.Transport.Transmission.WebSockets.Server;
    using Plexus.Processes;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.IO;
    using System.Linq;
    using System.Reflection;
    using System.Security.Cryptography.X509Certificates;
    using System.Threading.Tasks;
    using Plexus.Interop.Apps.Internal;
    using ILogger = Plexus.ILogger;
    using LogManager = Plexus.LogManager;
    using System;

    internal sealed class Broker : ProcessBase, IBroker
    {
        private static readonly ProtobufTransportProtocolSerializationProvider DefaultTransportSerializationProvider 
            = new ProtobufTransportProtocolSerializationProvider();

        private static readonly ProtobufProtocolSerializerFactory DefaultProtocolSerializationProvider 
            = new ProtobufProtocolSerializerFactory();

        private readonly BrokerFeatures _features;
        private readonly string _workingDir;
        private readonly ServerConnectionListener _connectionListener;
        private readonly IBrokerProcessor _brokerProcessor;
        private readonly IReadOnlyCollection<ITransportServer> _transportServers;
        private readonly IInteropContext _interopContext;

        protected override ILogger Log { get; } = LogManager.GetLogger<Broker>();

        public Broker(BrokerOptions options, IRegistryProvider registryProvider = null)
        {
            _features = EnvironmentHelper.GetBrokerFeatures();
            Log.Info($"Broker features: {_features}");
            var trustedLauncherId = EnvironmentHelper.GetLauncherAppInstanceId();
            Log.Info($"App launcher application instance id: {trustedLauncherId}");
            if (_features.HasFlag(BrokerFeatures.CheckAppInstanceId) && trustedLauncherId == null)
                throw new BrokerException($"{EnvironmentHelper.LauncherId} must be defined if {BrokerFeatures.CheckAppInstanceId} set.");
            _workingDir = Directory.GetCurrentDirectory();
            var binDir = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            var studioDir = Path.Combine(binDir, "studio");
            Log.Info("Studio dir: {0}", studioDir);
            var metadataDir = Path.GetFullPath(options.MetadataDir ?? Path.Combine(_workingDir, "metadata"));
            Log.Info("Metadata dir: {0}", metadataDir);
            var metadataFile = Path.Combine(metadataDir, "interop.json");
            IReadOnlyDictionary<string, string> staticFileMapping = new Dictionary<string, string>
            {
                {"/metadata/interop", metadataFile},
                {"/studio", studioDir}
            };
            var webSocketTransmissionServerOptions = new WebSocketTransmissionServerOptions(_workingDir, options.Port, staticFileMapping);
            var transportServers = new List<ITransportServer>
            {
                TransportServerFactory.Instance.Create(
                    PipeTransmissionServerFactory.Instance.Create(_workingDir),
                    DefaultTransportSerializationProvider),
                TransportServerFactory.Instance.Create(
                    WebSocketTransmissionServerFactory.Instance.Create(webSocketTransmissionServerOptions),
                    DefaultTransportSerializationProvider),
            };
            if (_features.HasFlag(BrokerFeatures.UseWSS))
            {
                var certificate = GetCertificate();
                if (certificate != null)
                {
                    var wssTransmissionServerOptions = new WebSocketTransmissionServerOptions(_workingDir, options.WssPort, staticFileMapping);
                    var sslProtocols = EnvironmentHelper.GetSslProtocols();
                    Log.Info($"{EnvironmentHelper.SslProtocols}={sslProtocols}");
                    transportServers.Add(TransportServerFactory.Instance.Create(
                        WebSocketTransmissionServerFactory.Instance.CreateSecure(wssTransmissionServerOptions, certificate, sslProtocols),
                        DefaultTransportSerializationProvider));
                }
            }
            _transportServers = transportServers;
            _connectionListener = new ServerConnectionListener(_transportServers);
            registryProvider = registryProvider ?? new JsonRegistryProvider(Path.Combine(metadataDir, "interop.json"));
            _interopContext = InteropContextFactory.Instance.Create(trustedLauncherId ?? default, metadataDir, registryProvider);
            _brokerProcessor = BrokerProcessorFactory.Instance.Create(
                _connectionListener.In,
                DefaultProtocolSerializationProvider,
                _interopContext,
                _features);
            OnStop(_connectionListener.Stop);
        }

        private X509Certificate2 GetCertificate()
        {
            try
            {
                var certificatePath = EnvironmentHelper.GetCertificatePath();
                if (string.IsNullOrEmpty(certificatePath))
                    throw new BrokerException($"{EnvironmentHelper.CertificatePath} must be defined if {BrokerFeatures.UseWSS} set.");

                var certificatePassword = EnvironmentHelper.GetCertificatePassword();
                if (string.IsNullOrEmpty(certificatePassword))
                {
                    Log.Info($"{EnvironmentHelper.CertificatePassword} is empty, try open certificate without password.");
                    return new X509Certificate2(certificatePath);
                }
                var flags = EnvironmentHelper.GetCertificateKeyStorageFlags();
                return new X509Certificate2(certificatePath, certificatePassword, flags);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Exception occured while creating certificate");
                return null;
            }
        }

        protected override async Task<Task> StartCoreAsync()
        {
            Log.Info("Starting broker in directory {0}", _workingDir);
            await Task
                .WhenAll(
                    _connectionListener.StartAsync(),
                    _brokerProcessor.StartAsync(),
                    _interopContext.StartAsync())
                .ConfigureAwait(false);
            Log.Info("Broker started in directory {0}", _workingDir);
            return ProcessAsync();
        }

        private async Task ProcessAsync()
        {
            try
            {
                await _brokerProcessor.Completion.ConfigureAwait(false);
            }
            finally
            {
                await _interopContext.StopAsync().IgnoreExceptions().ConfigureAwait(false);
                await Task.WhenAll(_transportServers.Select(x => x.StopAsync())).ConfigureAwait(false);
            }
        }
    }
}
