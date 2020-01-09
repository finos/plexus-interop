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
﻿namespace Plexus.Interop.Apps
{
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Plexus.Interop.Transport;

    public interface IAppLifecycleManager
    {
        IAppConnection AcceptConnection(ITransportConnection connection, AppConnectionDescriptor connectionInfo);

        void RemoveConnection(IAppConnection connection);

        bool TryGetOnlineConnection(UniqueId id, out IAppConnection connection);

        IReadOnlyCollection<IAppConnection> GetOnlineConnections();
        
        IEnumerable<string> FilterCanBeLaunched(IEnumerable<string> appIds);

        bool CanBeLaunched(string appId);

        Task<ResolvedConnection> ResolveConnectionAsync(string appId, ResolveMode mode, AppConnectionDescriptor referrerConnectionInfo);

        event Action<AppConnectionDescriptor> AppConnected;

        event Action<AppConnectionDescriptor> AppDisconnected;

        event Action<AppLaunchedAndConnected> AppLaunchedAndConnected;
    }
}
