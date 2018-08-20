/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
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
namespace Plexus.Interop.Protocol.Protobuf
{
    using Plexus.Interop.Protobuf;
    using Plexus.Interop.Protocol.Connect;
    using Plexus.Interop.Protocol.Discovery;
    using Plexus.Interop.Protocol.Invocation;
    using Plexus.Interop.Protocol.Protobuf.Internal;
    using Plexus.Pools;
    using System;
    using System.Linq;
    using DiscoveryMethodType = Plexus.Interop.Protocol.Discovery.MethodType;
    using DiscoveryMode = Discovery.DiscoveryMode;
    using MethodType = Plexus.Interop.Protocol.Protobuf.Internal.MethodType;

    internal sealed class ProtobufProtocolSerializer : IProtocolSerializer
    {
        private readonly IProtocolMessageFactory _messageFactory;
        private readonly ClientToBrokerRequestHandler<IPooledBuffer, Nothing> _clientToBrokerRequestSerializer;
        private readonly BrokerToClientRequestHandler<IPooledBuffer, Nothing> _brokerToClientRequestSerializer;
        private readonly InvocationMessageHandler<IPooledBuffer, Nothing> _invocationMessageSerializer;
        private readonly InvocationTargetHandler<IDisposable, InvocationStartRequest> _setInvocationTargetHandler;

        public ProtobufProtocolSerializer(IProtocolMessageFactory messageFactory)
        {
            _messageFactory = messageFactory;
            _clientToBrokerRequestSerializer = new ClientToBrokerRequestHandler<IPooledBuffer, Nothing>(Serialize, Serialize, Serialize);
            _brokerToClientRequestSerializer = new BrokerToClientRequestHandler<IPooledBuffer, Nothing>(Serialize);
            _invocationMessageSerializer = new InvocationMessageHandler<IPooledBuffer, Nothing>(Serialize, Serialize, Serialize);
            _setInvocationTargetHandler = new InvocationTargetHandler<IDisposable, InvocationStartRequest>(SetTarget, SetTarget);
        }

        public IConnectRequest DeserializeConnectRequest(IPooledBuffer msg)
        {
            using (var obj = ConnectRequest.Rent())
            {
                obj.MergeFrom(msg);
                return _messageFactory.CreateConnectRequest(
                    obj.ApplicationId,
                    obj.ApplicationInstanceId.ConvertFromProtoStrict());
            }
        }

        public IConnectResponse DeserializeConnectResponse(IPooledBuffer msg)
        {
            using (var obj = ConnectResponse.Rent())
            {
                obj.MergeFrom(msg);
                return _messageFactory.CreateConnectResponse(obj.ConnectionId.ConvertFromProtoStrict());
            }
        }

        public IPooledBuffer Serialize(IConnectRequest msg)
        {
            using (var obj = ConnectRequest.Rent())
            {
                obj.ApplicationId = msg.ApplicationId;
                obj.ApplicationInstanceId = obj.ApplicationInstanceId.MergeFrom(msg.ApplicationInstanceId);
                return obj.Serialize();
            }
        }

        public IPooledBuffer Serialize(IConnectResponse msg)
        {
            using (var obj = ConnectResponse.Rent())
            {
                obj.ConnectionId = obj.ConnectionId.MergeFrom(msg.ConnectionId);
                return obj.Serialize();
            }
        }

        private IPooledBuffer Serialize(IServiceDiscoveryRequest msg, Nothing _)
        {
            using (var envelope = ClientToBrokerRequestEnvelope.Rent())
            {
                var proto = ServiceDiscoveryRequest.Rent();
                proto.DiscoveryMode = ConvertToProto(msg.DiscoveryMode);
                proto.ConsumedService = ConvertToProto(msg.ConsumedService);
                envelope.ServiceDiscoveryRequest = proto;
                return envelope.Serialize();
            }
        }

        private IPooledBuffer Serialize(IMethodDiscoveryRequest msg, Nothing _)
        {
            using (var envelope = ClientToBrokerRequestEnvelope.Rent())
            {
                var proto = MethodDiscoveryRequest.Rent();
                proto.DiscoveryMode = ConvertToProto(msg.DiscoveryMode);
                proto.InputMessageId = msg.InputMessageId.ConvertToProto();
                proto.ConsumedMethod = ConvertToProto(msg.ConsumedMethod);
                proto.OutputMessageId = msg.OutputMessageId.ConvertToProto();
                envelope.MethodDiscoveryRequest = proto;
                return envelope.Serialize();
            }
        }

        private ConsumedMethodReference ConvertToProto(Maybe<IConsumedMethodReference> obj)
        {
            return obj.HasValue ? ConvertToProtoStrict(obj.Value) : null;
        }

        public IInvocationMessage DeserializeInvocationMessage(IPooledBuffer message)
        {
            using (var envelope = InvocationMessageEnvelope.Rent())
            {
                envelope.MergeFrom(message);
                switch (envelope.PayloadCase)
                {
                    case InvocationMessageEnvelope.PayloadOneofCase.Message:
                        return _messageFactory.CreateInvocationMessageHeader();
                    case InvocationMessageEnvelope.PayloadOneofCase.Confirmation:
                        return _messageFactory.CreateInvocationMessageReceived();
                    case InvocationMessageEnvelope.PayloadOneofCase.SendCompletion:
                        return _messageFactory.CreateInvocationSendCompletion();
                    default:
                        throw new InvalidOperationException($"Unexpected payload case: {envelope.PayloadCase}");
                }
            }
        }

        public IInvocationStarted DeserializeInvocationStarted(IPooledBuffer message)
        {
            using (var proto = InvocationStarted.Rent())
            {
                proto.MergeFrom(message);
                return _messageFactory.CreateInvocationStarted();
            }
        }

        public IInvocationStarting DeserializeInvocationStarting(IPooledBuffer message)
        {
            using (var proto = InvocationStarting.Rent())
            {
                proto.MergeFrom(message);
                return _messageFactory.CreateInvocationStarting();
            }
        }

        public IBrokerToClientRequest DeserializeBrokerToClientRequest(IPooledBuffer message)
        {
            using (var envelope = BrokerToClientRequestEnvelope.Rent())
            {
                envelope.MergeFrom(message);
                switch (envelope.PayloadCase)
                {
                    case BrokerToClientRequestEnvelope.PayloadOneofCase.InvocationStartRequested:
                        var msg = envelope.InvocationStartRequested;
                        return _messageFactory.CreateInvocationStartRequested(
                            msg.ServiceId.ConvertFromProtoStrict(),
                            msg.MethodId.ConvertFromProtoStrict(),
                            msg.ServiceAlias.ConvertFromProto(),
                            msg.ConsumerApplicationId.ConvertFromProtoStrict(),
                            msg.ConsumerApplicationInstanceId.ConvertFromProtoStrict(),
                            msg.ConsumerConnectionId.ConvertFromProtoStrict());
                    default:
                        throw new InvalidOperationException();
                }
            }
        }

        public IClientToBrokerRequest DeserializeClientToBrokerRequest(IPooledBuffer message)
        {
            using (var envelope = ClientToBrokerRequestEnvelope.Rent())
            {
                envelope.MergeFrom(message);
                switch (envelope.PayloadCase)
                {
                    case ClientToBrokerRequestEnvelope.PayloadOneofCase.InvocationStartRequest:
                        var invocationRequest = envelope.InvocationStartRequest;
                        IInvocationTarget target;
                        switch (invocationRequest.TargetCase)
                        {
                            case InvocationStartRequest.TargetOneofCase.ConsumedMethod:
                                target = ConvertFromProtoStrict(invocationRequest.ConsumedMethod);
                                break;
                            case InvocationStartRequest.TargetOneofCase.ProvidedMethod:
                                target = ConvertFromProtoStrict(invocationRequest.ProvidedMethod);
                                break;
                            default:
                                throw new InvalidOperationException($"Unexpected target payload: {invocationRequest.TargetCase}");
                        }
                        return _messageFactory.CreateInvocationStartRequest(target);
                    case ClientToBrokerRequestEnvelope.PayloadOneofCase.ServiceDiscoveryRequest:
                        return ConvertFromProtoStrict(envelope.ServiceDiscoveryRequest);
                    case ClientToBrokerRequestEnvelope.PayloadOneofCase.MethodDiscoveryRequest:
                        return ConvertFromProtoStrict(envelope.MethodDiscoveryRequest);
                    default:
                        throw new InvalidOperationException();
                }
            }
        }

        public IPooledBuffer Serialize(IMethodDiscoveryResponse message)
        {
            using (var proto = MethodDiscoveryResponse.Rent())
            {
                proto.Methods.AddRange(message.Methods.Select(ConvertToProto));
                return proto.Serialize();
            }
        }

        public IServiceDiscoveryResponse DeserializeServiceDiscoveryResponse(IPooledBuffer message)
        {
            using (var obj = ServiceDiscoveryResponse.Rent())
            {
                obj.MergeFrom(message);
                return _messageFactory.CreateServiceDiscoveryResponse(obj.Services.Select(ConvertFromProto).ToList());
            }
        }

        public IMethodDiscoveryResponse DeserializeMethodDiscoveryResponse(IPooledBuffer message)
        {
            using (var proto = MethodDiscoveryResponse.Rent())
            {
                proto.MergeFrom(message);
                return _messageFactory.CreateMethodDiscoveryResponse(proto.Methods.Select(ConvertFromProto).ToList());
            }
        }

        public IPooledBuffer Serialize(IClientToBrokerRequest message)
        {
            return message.Handle(_clientToBrokerRequestSerializer);
        }        

        public IPooledBuffer Serialize(IBrokerToClientRequest message)
        {
            return message.Handle(_brokerToClientRequestSerializer);
        }        

        public IPooledBuffer Serialize(IInvocationStarting message)
        {
            using (var proto = InvocationStarting.Rent())
            {
                return proto.Serialize();
            }
        }

        public IPooledBuffer Serialize(IInvocationStarted message)
        {
            using (var proto = InvocationStarted.Rent())
            {
                return proto.Serialize();
            }
        }

        public IPooledBuffer Serialize(IInvocationMessage message)
        {
            return message.Handle(_invocationMessageSerializer);
        }        

        public IPooledBuffer Serialize(IServiceDiscoveryResponse message)
        {
            using (var proto = ServiceDiscoveryResponse.Rent())
            {
                proto.Services.AddRange(message.Services.Select(ConvertToProto));
                return proto.Serialize();
            }
        }

        private IPooledBuffer Serialize(IInvocationStart message, Nothing _)
        {
            using (var envelope = ClientToBrokerRequestEnvelope.Rent())
            {
                var proto = InvocationStartRequest.Rent();
                message.Target.Handle(_setInvocationTargetHandler, proto);
                envelope.InvocationStartRequest = proto;
                return envelope.Serialize();
            }
        }

        private static IPooledBuffer Serialize(IInvocationStartRequested message, Nothing _)
        {
            using (var envelope = BrokerToClientRequestEnvelope.Rent())
            {
                var obj = InvocationStartRequested.Rent();
                obj.MethodId = message.MethodId.ConvertToProtoStrict();
                obj.ServiceId = message.ServiceId.ConvertToProtoStrict();
                obj.ServiceAlias = message.ServiceAlias.ConvertToProto();
                obj.ConsumerApplicationId = message.ConsumerApplicationId.ConvertToProtoStrict();
                obj.ConsumerApplicationInstanceId =
                    obj.ConsumerApplicationInstanceId.MergeFrom(message.ConsumerApplicationInstanceId);
                obj.ConsumerConnectionId = obj.ConsumerConnectionId.MergeFrom(message.ConsumerConnectionId);
                envelope.InvocationStartRequested = obj;
                return envelope.Serialize();
            }
        }

        private static IPooledBuffer Serialize(IInvocationMessageReceived message, Nothing _)
        {
            using (var envelope = InvocationMessageEnvelope.Rent())
            {
                var proto = InvocationMessageReceived.Rent();
                envelope.Confirmation = proto;
                return envelope.Serialize();
            }
        }

        private static IPooledBuffer Serialize(IInvocationMessageHeader message, Nothing _)
        {
            using (var envelope = InvocationMessageEnvelope.Rent())
            {
                var proto = InvocationMessageHeader.Rent();
                envelope.Message = proto;
                return envelope.Serialize();
            }
        }

        private static IPooledBuffer Serialize(IInvocationSendCompleted message, Nothing _)
        {
            using (var envelope = InvocationMessageEnvelope.Rent())
            {
                var proto = InvocationSendCompletion.Rent();
                envelope.SendCompletion = proto;
                return envelope.Serialize();
            }
        }

        private DiscoveredService ConvertToProto(IDiscoveredService service)
        {
            var proto = DiscoveredService.Rent();
            proto.ProvidedService = ConvertToProtoStrict(service.ProvidedService);
            proto.ConsumedService = ConvertToProtoStrict(service.ConsumedService);
            proto.ServiceTitle = service.ServiceTitle.ConvertToProto();
            proto.Methods.AddRange(service.Methods.Select(ConvertToProto));
            return proto;
        }

        private DiscoveredServiceMethod ConvertToProto(IDiscoveredServiceMethod method)
        {
            var proto = DiscoveredServiceMethod.Rent();
            proto.MethodType = ConvertToProto(method.MethodType);
            proto.InputMessageId = method.InputMessageId.ConvertToProtoStrict();
            proto.OutputMessageId = method.OutputMessageId.ConvertToProtoStrict();
            proto.MethodId = method.MethodId.ConvertToProtoStrict();
            proto.MethodTitle = method.MethodTitle.ConvertToProto();
            return proto;
        }

        private DiscoveredMethod ConvertToProto(IDiscoveredMethod method)
        {
            var proto = DiscoveredMethod.Rent();
            proto.MethodType = ConvertToProto(method.MethodType);
            proto.InputMessageId = method.InputMessageId.ConvertToProtoStrict();
            proto.OutputMessageId = method.OutputMessageId.ConvertToProtoStrict();
            proto.MethodTitle = method.MethodTitle.ConvertToProto();
            proto.ProvidedMethod = ConvertToProtoStrict(method.ProvidedMethod);
            proto.Options.AddRange(method.Options.Select(ConvertToProto));
            return proto;
        }

        private static Option ConvertToProto(IOption option)
        {
            var proto = Option.Rent();
            proto.Id = option.Id;
            proto.Value = option.Value;
            return proto;
        }

        private MethodType ConvertToProto(DiscoveryMethodType methodType)
        {
            switch (methodType)
            {
                case DiscoveryMethodType.Unary:
                    return MethodType.Unary;
                case DiscoveryMethodType.ServerStreaming:
                    return MethodType.ServerStreaming;
                case DiscoveryMethodType.ClientStreaming:
                    return MethodType.ClientStreaming;
                case DiscoveryMethodType.DuplexStreaming:
                    return MethodType.DuplexStreaming;
                default:
                    throw new ArgumentOutOfRangeException(nameof(methodType), methodType, null);
            }
        }

        private static ConsumedServiceReference ConvertToProto(Maybe<IConsumedServiceReference> obj)
        {
            if (!obj.HasValue)
            {
                return null;
            }
            var proto = ConsumedServiceReference.Rent();
            proto.ServiceAlias = obj.Value.ServiceAlias.ConvertToProto();
            proto.ServiceId = obj.Value.ServiceId.ConvertToProtoStrict();
            return proto;
        }

        private Internal.DiscoveryMode ConvertToProto(DiscoveryMode discoveryMode)
        {
            switch (discoveryMode)
            {
                case DiscoveryMode.Offline:
                    return Internal.DiscoveryMode.Offline;
                case DiscoveryMode.Online:
                    return Internal.DiscoveryMode.Online;
                default:
                    throw new ArgumentOutOfRangeException(nameof(discoveryMode), discoveryMode, null);
            }
        }

        private DiscoveryMode ConvertFromProto(Internal.DiscoveryMode discoveryMode)
        {
            switch (discoveryMode)
            {
                case Internal.DiscoveryMode.Offline:
                    return DiscoveryMode.Offline;
                case Internal.DiscoveryMode.Online:
                    return DiscoveryMode.Online;
                default:
                    throw new ArgumentOutOfRangeException(nameof(discoveryMode), discoveryMode, null);
            }
        }

        private IMethodDiscoveryRequest ConvertFromProtoStrict(MethodDiscoveryRequest proto)
        {
            return _messageFactory.CreateMethodDiscoveryRequest(
                proto.InputMessageId.ConvertFromProto(),
                proto.OutputMessageId.ConvertFromProto(),
                ConvertFromProto(proto.ConsumedMethod),
                ConvertFromProto(proto.DiscoveryMode));
        }

        private Maybe<IConsumedMethodReference> ConvertFromProto(ConsumedMethodReference proto)
        {
            return proto == null
                ? Maybe<IConsumedMethodReference>.Nothing
                : new Maybe<IConsumedMethodReference>(ConvertFromProtoStrict(proto));
        }

        private IServiceDiscoveryRequest ConvertFromProtoStrict(ServiceDiscoveryRequest proto)
        {
            return _messageFactory.CreateServiceDiscoveryRequest(
                ConvertFromProto(proto.ConsumedService),
                ConvertFromProto(proto.DiscoveryMode));
        }

        private IProvidedMethodReference ConvertFromProtoStrict(ProvidedMethodReference proto)
        {
            return _messageFactory.CreateProvidedMethodReference(
                ConvertFromProtoStrict(proto.ProvidedService),
                proto.MethodId.ConvertFromProtoStrict());
        }

        private IProvidedServiceReference ConvertFromProtoStrict(ProvidedServiceReference proto)
        {
            return _messageFactory.CreateProvidedServiceReference(
                proto.ServiceId.ConvertFromProtoStrict(),
                proto.ServiceAlias.ConvertFromProto(),
                proto.ApplicationId.ConvertFromProtoStrict(),
                proto.ConnectionId.ConvertFromProto());
        }

        private IConsumedMethodReference ConvertFromProtoStrict(ConsumedMethodReference proto)
        {
            return _messageFactory.CreateConsumedMethodReference(
                ConvertFromProtoStrict(proto.ConsumedService),
                proto.MethodId.ConvertFromProtoStrict());
        }

        private IConsumedServiceReference ConvertFromProtoStrict(ConsumedServiceReference proto)
        {
            return _messageFactory.CreateConsumedServiceReference(
                proto.ServiceId.ConvertFromProtoStrict(),
                proto.ServiceAlias.ConvertFromProto());
        }

        private Maybe<IConsumedServiceReference> ConvertFromProto(ConsumedServiceReference proto)
        {
            return proto == null
                ? Maybe<IConsumedServiceReference>.Nothing
                : new Maybe<IConsumedServiceReference>(ConvertFromProtoStrict(proto));
        }


        private IDiscoveredService ConvertFromProto(DiscoveredService proto)
        {
            return _messageFactory.CreateDiscoveredService(
                ConvertFromProtoStrict(proto.ConsumedService),
                ConvertFromProtoStrict(proto.ProvidedService),
                proto.ServiceTitle.ConvertFromProto(),
                proto.Methods.Select(ConvertFromProtoStrict).ToList());
        }

        private IDiscoveredMethod ConvertFromProto(DiscoveredMethod proto)
        {
            return _messageFactory.CreateDiscoveredMethod(
                ConvertFromProtoStrict(proto.ProvidedMethod),
                proto.MethodTitle.ConvertFromProto(),
                proto.InputMessageId.ConvertFromProtoStrict(),
                proto.OutputMessageId.ConvertFromProtoStrict(),
                ConvertFromProto(proto.MethodType),
                proto.Options.Select(ConvertFromProtoStrict).ToList());
        }

        private IOption ConvertFromProtoStrict(Option proto)
        {
            return _messageFactory.CreateOption(proto.Id.ConvertFromProtoStrict(), proto.Value);
        }

        private IDiscoveredServiceMethod ConvertFromProtoStrict(DiscoveredServiceMethod proto)
        {
            return _messageFactory.CreateDiscoveredServiceMethod(
                proto.MethodId.ConvertFromProtoStrict(),
                proto.MethodTitle.ConvertFromProto(),
                proto.InputMessageId.ConvertFromProtoStrict(),
                proto.OutputMessageId.ConvertFromProtoStrict(),
                ConvertFromProto(proto.MethodType));
        }

        private DiscoveryMethodType ConvertFromProto(MethodType proto)
        {
            switch (proto)
            {
                case MethodType.Unary:
                    return DiscoveryMethodType.Unary;
                case MethodType.ServerStreaming:
                    return DiscoveryMethodType.ServerStreaming;
                case MethodType.ClientStreaming:
                    return DiscoveryMethodType.ClientStreaming;
                case MethodType.DuplexStreaming:
                    return DiscoveryMethodType.DuplexStreaming;
                default:
                    throw new ArgumentOutOfRangeException(nameof(proto), proto, null);
            }
        }

        private static IDisposable SetTarget(IProvidedMethodReference obj, InvocationStartRequest req)
        {
            var proto = ConvertToProtoStrict(obj);
            req.ProvidedMethod = proto;
            return proto;
        }

        private static IDisposable SetTarget(IConsumedMethodReference obj, InvocationStartRequest req)
        {
            var proto = ConvertToProtoStrict(obj);
            req.ConsumedMethod = proto;
            return proto;
        }

        private static ConsumedMethodReference ConvertToProtoStrict(IConsumedMethodReference obj)
        {
            var proto = ConsumedMethodReference.Rent();
            proto.ConsumedService = ConvertToProtoStrict(obj.ConsumedService);
            proto.MethodId = obj.MethodId.ConvertToProtoStrict();
            return proto;
        }

        private static ConsumedServiceReference ConvertToProtoStrict(IConsumedServiceReference obj)
        {
            var proto = ConsumedServiceReference.Rent();
            proto.ServiceId = obj.ServiceId.ConvertToProtoStrict();
            proto.ServiceAlias = obj.ServiceAlias.ConvertToProto();
            return proto;
        }

        private static ProvidedMethodReference ConvertToProtoStrict(IProvidedMethodReference obj)
        {
            var proto = ProvidedMethodReference.Rent();
            proto.ProvidedService = ConvertToProtoStrict(obj.ProvidedService);
            proto.MethodId = obj.MethodId.ConvertToProtoStrict();
            return proto;
        }

        private static ProvidedServiceReference ConvertToProtoStrict(IProvidedServiceReference obj)
        {
            var proto = ProvidedServiceReference.Rent();
            proto.ServiceId = obj.ServiceId.ConvertToProtoStrict();
            proto.ApplicationId = obj.ApplicationId.ConvertToProtoStrict();
            proto.ConnectionId = proto.ConnectionId.MergeFrom(obj.ConnectionId);
            proto.ServiceAlias = obj.ServiceAlias.ConvertToProto();
            return proto;
        }
    }
}
