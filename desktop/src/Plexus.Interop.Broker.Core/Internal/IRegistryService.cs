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
﻿namespace Plexus.Interop.Broker.Internal
{
    using Plexus.Interop.Metamodel;
    using Plexus.Interop.Protocol;
    using System.Collections.Generic;

    internal interface IRegistryService
    {
        IApplication GetApplication(string appId);

        IConsumedService GetConsumedService(string appId, IConsumedServiceReference reference);

        IConsumedMethod GetConsumedMethod(string appId, IConsumedMethodReference reference);

        IProvidedService GetProvidedService(IProvidedServiceReference reference);

        IProvidedMethod GetProvidedMethod(IProvidedMethodReference reference);

        IReadOnlyCollection<IProvidedMethod> GetMatchingProvidedMethods(IConsumedMethod consumedMethod);

        IReadOnlyCollection<IProvidedMethod> GetMatchingProvidedMethods(string appId, IConsumedMethodReference reference);        

        IReadOnlyCollection<IProvidedMethod> GetMatchingProvidedMethods(IApplication application);

        IReadOnlyCollection<IProvidedMethod> GetMatchingProvidedMethods(string appId);

        bool IsApplicationDefined(string appId);

        IReadOnlyCollection<(IConsumedMethod Consumed, IProvidedMethod Provided)> GetMethodMatches(
            string appId,
            IConsumedServiceReference consumedServiceReference);

        IReadOnlyCollection<(IConsumedMethod Consumed, IProvidedMethod Provided)> GetMethodMatches(string appId);
    }
}
