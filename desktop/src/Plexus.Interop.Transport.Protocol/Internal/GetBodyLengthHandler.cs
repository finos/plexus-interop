/**
 * Copyright 2017-2020 Plexus Interop Deutsche Bank AG
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
﻿namespace Plexus.Interop.Transport.Protocol.Internal
{
    internal sealed class GetBodyLengthHandler : ITransportHeaderHandler<Maybe<int>, Nothing>, ITransportChannelHeaderHandler<Maybe<int>, Nothing>
    {
        public static GetBodyLengthHandler Instance = new GetBodyLengthHandler();

        public Maybe<int> Handle(ITransportHeader header)
        {
            return header.Handle(new TransportHeaderHandler<Maybe<int>, Nothing>(this), Nothing.Instance);
        }

        public Maybe<int> Handle(ITransportConnectionHeader header, Nothing _)
        {
            return Nothing.Instance;
        }

        public Maybe<int> Handle(ITransportChannelHeader header, Nothing _)
        {
            return header.Handle(new TransportChannelHeaderHandler<Maybe<int>, Nothing>(this), _);
        }

        public Maybe<int> Handle(ITransportChannelOpenHeader header, Nothing _)
        {
            return Nothing.Instance;
        }

        public Maybe<int> Handle(ITransportChannelCloseHeader header, Nothing _)
        {
            return Nothing.Instance;
        }

        public Maybe<int> Handle(ITransportFrameHeader header, Nothing _)
        {
            return header.Length;
        }
    }
}
