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
 namespace Plexus.Interop.Internal.ClientProtocol.Invocations
{
    using Plexus.Channels;
    using Plexus.Interop.Protocol;
    using Plexus.Interop.Transport;
    using System.Threading.Tasks;

    internal sealed class IncomingInvocation<TRequest, TResponse> : Invocation<TResponse, TRequest>, IIncomingInvocation<TRequest, TResponse>
    {
        private readonly ILogger _log;
        private readonly ITransportChannel _channel;
        private readonly IProtocolImplementation _protocol;

        public IncomingInvocation(
            IncomingInvocationDescriptor info,
            ITransportChannel channel,
            IProtocolImplementation protocol,
            IMarshaller<TRequest> requestMarshaller,
            IMarshaller<TResponse> responseMarshaller)
            : base(channel, protocol, responseMarshaller, requestMarshaller)
        {
            _log = LogManager.GetLogger<IncomingInvocation<TRequest, TResponse>>(channel.Id.ToString());
            Info = info;
            _channel = channel;
            _protocol = protocol;
        }

        public IncomingInvocationDescriptor Info { get; }

        protected override async Task InitializeSendingAsync()
        {
            using (var invocationStarted = _protocol.MessageFactory.CreateInvocationStarted())
            {
                var serialized = _protocol.Serializer.Serialize(invocationStarted);
                try
                {
                    await _channel.Out.WriteAsync(new TransportMessageFrame(serialized), CancellationToken).ConfigureAwait(false);
                    _log.Trace("Invocation started event sent: {0}", Info);
                }
                catch
                {
                    serialized.Dispose();
                    throw;
                }
            }
        }

        protected override Task InitializeReceivingAsync()
        {
            return TaskConstants.Completed;
        }
    }
}
