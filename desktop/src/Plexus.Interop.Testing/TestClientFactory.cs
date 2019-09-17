/**
 * Copyright 2017-2019 Plexus Interop Deutsche Bank AG
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
﻿namespace Plexus.Interop.Testing
{
    using System;
    using System.Threading.Tasks;

    public sealed class TestClientFactory
    {
        private readonly Func<ITestBroker, UniqueId, Task<IClient>> _createClientDelegate;

        public TestClientFactory(Func<ITestBroker, UniqueId, Task<IClient>> createClientDelegate)
        {
            _createClientDelegate = createClientDelegate;
        }

        public TestClientFactory(Func<ITestBroker, UniqueId, IClient> createClientDelegate)
        {
            _createClientDelegate = (x, y) => Task.FromResult(createClientDelegate(x, y));
        }

        public Task<IClient> CreateClientAsync(ITestBroker targetBroker, UniqueId appInstanceId)
        {
            return _createClientDelegate(targetBroker, appInstanceId);
        }
    }
}
