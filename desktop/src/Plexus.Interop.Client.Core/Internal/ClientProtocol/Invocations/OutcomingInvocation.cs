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
namespace Plexus.Interop.Internal.ClientProtocol.Invocations
{
    using Plexus.Channels;
    using Plexus.Interop.Protocol;
    using Plexus.Interop.Protocol.Invocation;
    using Plexus.Interop.Transport;
    using System.Threading.Tasks;

    internal sealed class OutcomingInvocation<TRequest, TResponse> : Invocation<TRequest, TResponse>, IOutcomingInvocation<TRequest, TResponse>
    {
        private readonly ILogger _log;
        private readonly ITransportChannel _channel;
        private readonly IProtocolImplementation _protocol;

        public OutcomingInvocation(
            OutcomingInvocationDescriptor descriptor,
            ITransportChannel channel,
            IProtocolImplementation protocol,
            IMarshaller<TRequest> requestMarshaller,
            IMarshaller<TResponse> responseMarshaller)
            : base(channel, protocol, requestMarshaller, responseMarshaller)
        {
            _channel = channel;
            _log = LogManager.GetLogger<OutcomingInvocation<TRequest, TResponse>>(_channel.Id.ToString());
            Info = descriptor;
            _protocol = protocol;
        }

        public OutcomingInvocationDescriptor Info { get; }

        protected override async Task InitializeSendingAsync()
        {
            var target =
                Info.Target.HasValue
                    ? (IInvocationTarget)_protocol.MessageFactory.CreateProvidedMethodReference(
                        _protocol.MessageFactory.CreateProvidedServiceReference(
                            Info.Method.ServiceId,
                            Info.Target.Value.ServiceAliasId,
                            Info.Target.Value.ApplicationId,
                            Info.Target.Value.ConnectionId),
                        Info.Method.MethodId)
                    : _protocol.MessageFactory.CreateConsumedMethodReference(
                        _protocol.MessageFactory.CreateConsumedServiceReference(Info.Method.ServiceId, Info.Method.ServiceAliasId),
                        Info.Method.MethodId);
            using (var request = _protocol.MessageFactory.CreateInvocationStartRequest(target))
            {
                var serialized = _protocol.Serializer.Serialize(request);
                try
                {
                    await _channel.Out.WriteAsync(new TransportMessageFrame(serialized)).ConfigureAwait(false);
                    _log.Trace("Invocation start request sent: {0}", Info);
                }
                catch
                {
                    serialized.Dispose();
                    throw;
                }
            }            
        }

        protected override async Task InitializeReceivingAsync()
        {
            _log.Trace("Awaiting invocation start events");
            using (var frame = await _channel.In.ReadAsync(CancellationToken).ConfigureAwait(false))
            using (_protocol.Serializer.DeserializeInvocationStarting(frame.Payload))
            {
                _log.Trace("Invocation starting event received: {0}", Info);
            }
            using (var frame = await _channel.In.ReadAsync(CancellationToken).ConfigureAwait(false))
            using (_protocol.Serializer.DeserializeInvocationStarted(frame.Payload))
            {
                _log.Trace("Invocation started event received: {0}", Info);
            }
        }
    }
}
