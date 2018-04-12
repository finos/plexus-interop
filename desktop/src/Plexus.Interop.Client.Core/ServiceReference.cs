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
﻿namespace Plexus.Interop
{
    public sealed class ServiceReference
    {
        public static ServiceReference Create(string serviceId, string serviceAlias)
        {
            return new ServiceReference(serviceId, serviceAlias);
        }

        public static ServiceReference Create(string serviceId)
        {
            return new ServiceReference(serviceId, Maybe<string>.Nothing);
        }

        internal ServiceReference(string id, Maybe<string> @alias)
        {
            Id = id;
            Alias = alias;
        }

        public string Id { get; }

        public Maybe<string> Alias { get; }

        public override string ToString()
        {
            return $"{nameof(Id)}: {Id}, {nameof(Alias)}: {Alias}";
        }
    }
}
