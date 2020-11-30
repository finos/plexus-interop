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
namespace Plexus.Interop.Apps
{
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Plexus.Interop.Transport;

    public interface IAppLifecycleManager : IAppConnectedEventProvider
    {
        IAppConnection AcceptConnection(ITransportConnection connection, AppConnectionDescriptor connectionInfo);

        bool TryRemoveConnection(IAppConnection connection);

        bool TryGetOnlineConnection(UniqueId connectionId, out IAppConnection connection);

        bool TryGetOnlineConnection(UniqueId appInstanceId, string app, out IAppConnection connection);

        IReadOnlyCollection<IAppConnection> GetOnlineConnections();
        
        IEnumerable<string> FilterCanBeLaunched(IEnumerable<string> appIds);

        bool CanBeLaunched(string appId);

        Task<ResolvedConnection> LaunchAndConnectAsync(string appId, ResolveMode mode, AppConnectionDescriptor referrerConnectionInfo);

        IReadOnlyCollection<IAppConnection> GetAppInstanceConnections(UniqueId appInstanceId);

        IReadOnlyCollection<IAppConnection> GetAppConnections(string appId);

        bool TryGetConnectionInProgress(UniqueId appInstanceId, string appId, out Task<IAppConnection> appConnection);
    }
}
