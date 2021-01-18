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
namespace Plexus.Interop
{
    using Google.Protobuf;
    using Google.Protobuf.Reflection;
    using System;
    using System.IO;
    using System.Reflection;

    public sealed class ProtobufMarshallerProvider : IMarshallerProvider
    {
        private const int MessageIdFieldNum = 9650;
        private const string DescriptorPropertyName = "Descriptor";
        private static readonly TypeInfo ProtobufMessageType = typeof(IMessage).GetTypeInfo();

        public IMarshaller<T> GetMarshaller<T>()
        {
            var typeInfo = typeof(T).GetTypeInfo();
            if (!ProtobufMessageType.IsAssignableFrom(typeInfo))
            {
                throw new InvalidOperationException($"Provided type {typeInfo} is not a protobuf message");
            }
            var descriptorProperty = typeInfo.GetDeclaredProperty(DescriptorPropertyName);
            var messageDescriptor = (MessageDescriptor)descriptorProperty.GetValue(null);
            if (!messageDescriptor.CustomOptions.TryGetString(MessageIdFieldNum, out var id))
            {
                id = messageDescriptor.FullName;
            }
            return new Marshaller<T>(id, Encode, Decode<T>);
        }

        private static T Decode<T>(Stream stream)
        {
            var msg = Activator.CreateInstance<T>();
            ((IMessage)msg).MergeFrom(stream);
            return msg;
        }

        private static void Encode<T>(T obj, Stream stream)
        {
            ((IMessage)obj).WriteTo(stream);
        }
    }
}
