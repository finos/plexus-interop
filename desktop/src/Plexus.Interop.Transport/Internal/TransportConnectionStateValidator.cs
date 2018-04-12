/**
 * Copyright 2018 Plexus Interop Deutsche Bank AG
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
 using System;
using Plexus.Interop.Protocol.Common;
using Plexus.Interop.Transport.Protocol;

namespace Plexus.Interop.Transport.Internal
{
    internal sealed class TransportConnectionStateValidator
    {
        private readonly TransportHeaderHandler<Nothing, Nothing> _handler;
        private readonly TransportConnectionHeaderHandler<Nothing, Nothing> _connectionHandler;
        private State _state = State.NotConnected;

        public TransportConnectionStateValidator()
        {
            _handler = new TransportHeaderHandler<Nothing, Nothing>(Handle, Handle);
            _connectionHandler = new TransportConnectionHeaderHandler<Nothing, Nothing>(Handle, Handle);
        }

        public bool IsDisconnected => _state == State.Disconnected;

        public bool IsConnected => _state == State.Connected;

        public void OnMessage(ITransportHeader header)
        {
            header.Handle(_handler, Nothing.Instance);
        }

        public void OnCompleted()
        {
            if (_state != State.Disconnected)
            {
                throw new ProtocolException($"Completed unexpectedly in state {_state}");
            }
        }

        private Nothing Handle(ITransportChannelHeader header, Nothing _)
        {
            switch (_state)
            {
                case State.Connected:
                    break;
                default:
                    throw new ProtocolException($"Received unexpected header of type {header.GetType()} in state {_state}");
            }
            return _;
        }

        private Nothing Handle(ITransportConnectionHeader header, Nothing _)
        {
            return header.Handle(_connectionHandler, _);
        }

        private Nothing Handle(ITransportConnectionCloseHeader header, Nothing _)
        {
            switch (_state)
            {
                case State.NotConnected:
                case State.Connected:
                    _state = State.Disconnected;
                    ThrowIfTermination(header);
                    break;
                default:
                    throw new ProtocolException($"Received unexpected header of type {header.GetType()} in state {_state}");
            }
            return _;
        }

        private void ThrowIfTermination(ITransportConnectionCloseHeader header)
        {
            switch (header.Completion.Status)
            {
                case CompletionStatusHeader.Canceled:
                    throw new OperationCanceledException();
                case CompletionStatusHeader.Failed:
                    var error = header.Completion.Error.Value;
                    throw new RemoteErrorException(error);
            }
        }

        private Nothing Handle(ITransportConnectionOpenHeader header, Nothing _)
        {
            switch (_state)
            {
                case State.NotConnected:
                    _state = State.Connected;
                    break;
                default:
                    throw new ProtocolException($"Received unexpected header of type {header.GetType()} in state {_state}");
            }
            return _;
        }

        private enum State
        {
            NotConnected,
            Connected,
            Disconnected
        }
    }
}