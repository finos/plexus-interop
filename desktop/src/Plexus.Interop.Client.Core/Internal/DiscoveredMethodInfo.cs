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
﻿namespace Plexus.Interop.Internal
{
    using System;
    using JetBrains.Annotations;

    internal sealed class DiscoveredMethodInfo
    {
        public DiscoveredMethodInfo(
            [NotNull] string hostApplicationId,
            Maybe<UniqueId> hostConnectionId,             
            Maybe<string> hostServiceAlias, 
            Maybe<string> title, 
            MethodType type)
        {
            HostApplicationId = hostApplicationId ?? throw new ArgumentNullException(nameof(hostApplicationId));
            HostConnectionId = hostConnectionId;            
            HostServiceAlias = hostServiceAlias;
            Title = title;
            Type = type;
        }

        public string HostApplicationId { get; }

        public Maybe<UniqueId> HostConnectionId { get; }        

        public Maybe<string> HostServiceAlias { get; }

        public Maybe<string> Title { get; }

        public MethodType Type { get; }

        public override string ToString()
        {
            return $"{nameof(HostApplicationId)}: {HostApplicationId}, {nameof(HostConnectionId)}: {HostConnectionId}, {nameof(HostServiceAlias)}: {HostServiceAlias}, {nameof(Title)}: {Title}, {nameof(Type)}: {Type}";
        }

        private bool Equals(DiscoveredMethodInfo other)
        {
            return string.Equals(HostApplicationId, other.HostApplicationId) && HostConnectionId.Equals(other.HostConnectionId) && HostServiceAlias.Equals(other.HostServiceAlias) && Title.Equals(other.Title) && Type == other.Type;
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            return obj is DiscoveredMethodInfo && Equals((DiscoveredMethodInfo) obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                var hashCode = (HostApplicationId != null ? HostApplicationId.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ HostConnectionId.GetHashCode();
                hashCode = (hashCode * 397) ^ HostServiceAlias.GetHashCode();
                hashCode = (hashCode * 397) ^ Title.GetHashCode();
                hashCode = (hashCode * 397) ^ (int) Type;
                return hashCode;
            }
        }
    }
}
