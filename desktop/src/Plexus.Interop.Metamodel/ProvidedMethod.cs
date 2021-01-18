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
﻿namespace Plexus.Interop.Metamodel
{
    using System.Collections.Generic;

    public sealed class ProvidedMethod : IProvidedMethod
    {
        public Maybe<string> Title { get; set; }
               
        public IProvidedService ProvidedService { get; set; }

        public IMethod Method { get; set; }

        public Maybe<LaunchMode> LaunchMode { get; set; }

        public int TimeoutMs { get; set; } = 0;

        public IReadOnlyCollection<IOption> Options { get; set; }

        public override string ToString()
        {
            return $"{nameof(Title)}: {Title}, {nameof(Method)}: {Method}, {nameof(LaunchMode)}: {LaunchMode}, {nameof(TimeoutMs)}: {TimeoutMs}";
        }
    }
}
