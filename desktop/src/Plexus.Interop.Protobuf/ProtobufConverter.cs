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
namespace Plexus.Interop.Protobuf
{    
    using Plexus.Interop.Protocol.Common;
    using System;
    using PlexusUniqueId = Plexus.UniqueId;    

    public static class ProtobufConverter
    {
        public static CompletionHeader ConvertFromProto(this Completion proto)
        {
            if (proto == null)
            {
                return CompletionHeader.Completed;
            }
            return new CompletionHeader(ConvertFromProto(proto.Status), ConvertFromProto(proto.Error));
        }

        public static CompletionStatusHeader ConvertFromProto(this Completion.Types.Status message)
        {
            switch (message)
            {
                case Completion.Types.Status.Completed:
                    return CompletionStatusHeader.Completed;
                case Completion.Types.Status.Canceled:
                    return CompletionStatusHeader.Canceled;
                case Completion.Types.Status.Failed:
                    return CompletionStatusHeader.Failed;
                default:
                    throw new ArgumentOutOfRangeException(nameof(message), message, null);
            }
        }

        public static PlexusUniqueId ConvertFromProtoStrict(this UniqueId guid)
        {
            if (guid == null || (long)guid.Lo == 0L && (long)guid.Hi == 0L)
            {
                throw new InvalidOperationException($"Cannot convert from proto as UniqueId: {guid}");
            }         
            return PlexusUniqueId.FromHiLo(guid.Hi, guid.Lo);
        }

        public static Maybe<PlexusUniqueId> ConvertFromProto(this UniqueId guid)
        {
            if (guid == null || (long)guid.Lo == 0L && (long)guid.Hi == 0L)
            {
                return Maybe<PlexusUniqueId>.Nothing;
            }
            return PlexusUniqueId.FromHiLo(guid.Hi, guid.Lo);
        }

        public static string ConvertFromProtoStrict(this string str)
        {
            if (string.IsNullOrEmpty(str))
            {
                throw new InvalidOperationException("Required string is unspecified");
            }
            return str;
        }

        public static Maybe<string> ConvertFromProto(this string str)
        {
            return string.IsNullOrEmpty(str) ? Maybe<string>.Nothing : str;
        }

        public static Maybe<ErrorHeader> ConvertFromProto(this Error proto)
        {
            return proto == null
                ? Maybe<ErrorHeader>.Nothing
                : new Maybe<ErrorHeader>(new ErrorHeader(proto.Message, proto.Details));
        }

        public static Completion MergeFrom(this Completion proto, CompletionHeader message)
        {
            proto = proto ?? new Completion();
            proto.Status = ConvertToProto(message.Status);
            proto.Error = message.Error.HasValue ? MergeFrom(proto.Error, message.Error.Value) : null;
            return proto;
        }

        public static Error MergeFrom(this Error proto, ErrorHeader message)
        {
            proto = proto ?? new Error();
            proto.Message = message.Message;
            proto.Details = message.Details;
            return proto;
        }

        public static string ConvertToProtoStrict(this string str)
        {
            if (string.IsNullOrEmpty(str))
            {
                throw new InvalidOperationException("Required string is unspecified");
            }
            return str;
        }

        public static string ConvertToProto(this Maybe<string> str)
        {
            if (!str.HasValue)
            {
                return string.Empty;
            }
            return str.Value ?? string.Empty;
        }

        public static UniqueId MergeFrom(this UniqueId proto, Maybe<PlexusUniqueId> guid)
        {
            proto = proto ?? new UniqueId();
            if (guid.HasValue)
            {
                var value = guid.Value;
                proto.Lo = value.Lo;
                proto.Hi = value.Hi;
            }
            else
            {
                proto.Lo = 0;
                proto.Hi = 0;
            }
            return proto;
        }

        public static Completion.Types.Status ConvertToProto(this CompletionStatusHeader message)
        {
            switch (message)
            {
                case CompletionStatusHeader.Completed:
                    return Completion.Types.Status.Completed;
                case CompletionStatusHeader.Canceled:
                    return Completion.Types.Status.Canceled;
                case CompletionStatusHeader.Failed:
                    return Completion.Types.Status.Failed;
                default:
                    throw new ArgumentOutOfRangeException(nameof(message), message, null);
            }
        }
    }
}
