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
﻿namespace Plexus.Interop.Metamodel
{
    using System.Collections.Generic;

    public sealed class ProvidedService : IProvidedService
    {
        public IService Service { get; set; }

        public IApplication Application { get; set; }

        public IMatchPattern To { get; set; }

        public Maybe<string> Title { get; set; }

        public Maybe<string> Alias { get; set; }

        public Dictionary<string, IProvidedMethod> Methods { get; set; } = new Dictionary<string, IProvidedMethod>();        

        IReadOnlyDictionary<string, IProvidedMethod> IProvidedService.Methods => Methods;

        public Maybe<LaunchMode> LaunchMode { get; set; } = Metamodel.LaunchMode.SingleInstance;
    }
}
