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
﻿using System;

namespace Plexus.Interop.Transport.Protocol
{
    public struct TransportChannelHeaderHandler<T, TArgs> : ITransportChannelHeaderHandler<T, TArgs>
    {
        private readonly Func<ITransportChannelOpenHeader, TArgs, T> _openHandler;
        private readonly Func<ITransportChannelCloseHeader, TArgs, T> _closeHandler;
        private readonly Func<ITransportFrameHeader, TArgs, T> _frameHandler;

        public TransportChannelHeaderHandler(
            Func<ITransportChannelOpenHeader, TArgs, T> openHandler,
            Func<ITransportChannelCloseHeader, TArgs, T> closeHandler,
            Func<ITransportFrameHeader, TArgs, T> frameHandler)
        {
            _openHandler = openHandler;
            _closeHandler = closeHandler;
            _frameHandler = frameHandler;
        }

        public TransportChannelHeaderHandler(ITransportChannelHeaderHandler<T, TArgs> handler)
            : this(handler.Handle, handler.Handle, handler.Handle)
        {
        }

        public T Handle(ITransportChannelOpenHeader header, TArgs args)
        {
            return _openHandler(header, args);
        }

        public T Handle(ITransportChannelCloseHeader header, TArgs args)
        {
            return _closeHandler(header, args);
        }

        public T Handle(ITransportFrameHeader header, TArgs args)
        {
            return _frameHandler(header, args);
        }
    }
}
