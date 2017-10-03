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
﻿namespace Plexus.Interop
{
    public sealed class ProvidedMethodReference : IMethod
    {
        public static ProvidedMethodReference Create(ProvidedServiceReference providedService, string methodName)
        {
            return new ProvidedMethodReference(providedService, methodName);
        }

        public static ProvidedMethodReference Create(string serviceId, string methodName, string applicationId)
        {
            return Create(ProvidedServiceReference.Create(serviceId, applicationId), methodName);
        }

        public static ProvidedMethodReference Create(string serviceId, string serviceAliasId, string methodName, string applicationId)
        {
            return Create(ProvidedServiceReference.Create(serviceId, serviceAliasId, applicationId), methodName);
        }

        public static ProvidedMethodReference Create(string serviceId, string methodName, string applicationId, UniqueId connectionId)
        {
            return Create(ProvidedServiceReference.Create(serviceId, applicationId, connectionId), methodName);
        }

        public static ProvidedMethodReference Create(string serviceId, string serviceAliasId, string methodName, string applicationId, UniqueId connectionId)
        {
            return Create(ProvidedServiceReference.Create(serviceId, serviceAliasId, applicationId, connectionId), methodName);
        }

        internal ProvidedMethodReference(ProvidedServiceReference providedService, string methodName)
        {
            ProvidedService = providedService;
            Name = methodName;
            CallDescriptor = new MethodCallDescriptor(this);
        }

        public ProvidedServiceReference ProvidedService { get; }
        
        public string Name { get; }

        public MethodCallDescriptor CallDescriptor { get; }

        public override string ToString()
        {
            return $"{nameof(ProvidedService)}: {{{ProvidedService}}}, {nameof(Name)}: {Name}";
        }
    }
}
