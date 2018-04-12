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
﻿namespace Plexus.Interop.Protocol.Invocation
{
    using System;

    public sealed class InvocationTargetHandler<T, TArgs>
    {
        private readonly Func<IConsumedMethodReference, TArgs, T> _consumedMethodHandler;
        private readonly Func<IProvidedMethodReference, TArgs, T> _providedMethodHandler;

        public InvocationTargetHandler(
            Func<IConsumedMethodReference, TArgs, T> consumedMethodHandler, 
            Func<IProvidedMethodReference, TArgs, T> providedMethodHandler)
        {
            _consumedMethodHandler = consumedMethodHandler;
            _providedMethodHandler = providedMethodHandler;
        }

        public T Handle(IConsumedMethodReference target, TArgs args)
        {
            return _consumedMethodHandler(target, args);
        }

        public T Handle(IProvidedMethodReference target, TArgs args)
        {
            return _providedMethodHandler(target, args);
        }
    }
}
