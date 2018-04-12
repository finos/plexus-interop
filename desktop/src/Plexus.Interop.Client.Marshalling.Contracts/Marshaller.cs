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
﻿namespace Plexus.Interop
{
    using System;
    using System.IO;

    public sealed class Marshaller<T> : IMarshaller<T>
    {
        private readonly Action<T, Stream> _encodeAction;
        private readonly Func<Stream, T> _decodeFunc;

        public Marshaller(
            string id,
            Action<T, Stream> encodeAction,
            Func<Stream, T> decodeFunc)
        {
            MessageId = id;
            _encodeAction = encodeAction;
            _decodeFunc = decodeFunc;
        }

        public string MessageId { get; }

        public void Encode(T obj, Stream stream)
        {
            _encodeAction(obj, stream);
        }

        public T Decode(Stream stream)
        {
            return _decodeFunc(stream);
        }
    }
}
