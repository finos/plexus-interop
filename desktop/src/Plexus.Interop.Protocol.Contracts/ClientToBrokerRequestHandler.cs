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
﻿using Plexus.Interop.Protocol.Discovery;
using Plexus.Interop.Protocol.Invocation;
using System;

namespace Plexus.Interop.Protocol
{
    public struct ClientToBrokerRequestHandler<T, TArgs>
    {
        private readonly Func<IInvocationStart, TArgs, T> _handleInvocationStart;
        private readonly Func<IServiceDiscoveryRequest, TArgs, T> _handleServiceDiscoveryRequest;
        private readonly Func<IMethodDiscoveryRequest, TArgs, T> _handleMethodDiscoveryRequest;

        public ClientToBrokerRequestHandler(
            Func<IInvocationStart, TArgs, T> handleInvocationStart,
            Func<IServiceDiscoveryRequest, TArgs, T> handleServiceDiscoveryRequest, 
            Func<IMethodDiscoveryRequest, TArgs, T> handleMethodDiscoveryRequest)
        {
            _handleInvocationStart = handleInvocationStart;
            _handleServiceDiscoveryRequest = handleServiceDiscoveryRequest;
            _handleMethodDiscoveryRequest = handleMethodDiscoveryRequest;
        }

        public T Handle(IInvocationStart message, TArgs args)
        {
            return _handleInvocationStart(message, args);
        }

        public T Handle(IServiceDiscoveryRequest message, TArgs args)
        {
            return _handleServiceDiscoveryRequest(message, args);
        }

        public T Handle(IMethodDiscoveryRequest message, TArgs args)
        {
            return _handleMethodDiscoveryRequest(message, args);
        }
    }
}
