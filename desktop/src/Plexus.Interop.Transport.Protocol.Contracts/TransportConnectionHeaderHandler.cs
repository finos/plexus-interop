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
﻿using System;

namespace Plexus.Interop.Transport.Protocol
{
    public struct TransportConnectionHeaderHandler<T, TArgs> : ITransportConnectionHeaderHandler<T, TArgs>
    {
        private readonly Func<ITransportConnectionOpenHeader, TArgs, T> _openHandler;
        private readonly Func<ITransportConnectionCloseHeader, TArgs, T> _closeHandler;

        public TransportConnectionHeaderHandler(
            Func<ITransportConnectionOpenHeader, TArgs, T> openHandler,
            Func<ITransportConnectionCloseHeader, TArgs, T> closeHandler)
        {
            _openHandler = openHandler;
            _closeHandler = closeHandler;
        }

        public TransportConnectionHeaderHandler(ITransportConnectionHeaderHandler<T, TArgs> handler)
            : this(handler.Handle, handler.Handle)
        {
        }

        public T Handle(ITransportConnectionOpenHeader header, TArgs args)
        {
            return _openHandler(header, args);
        }

        public T Handle(ITransportConnectionCloseHeader header, TArgs args)
        {
            return _closeHandler(header, args);
        }
    }
}
