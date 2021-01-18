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
﻿/**
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
namespace Plexus.Interop.Apps.Internal.Services.ContextLinkage
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Reactive;
    using System.Reactive.Concurrency;
    using System.Reactive.Linq;
    using System.Reactive.Subjects;

    internal class AppConnectionsSet
    {
        private readonly UniqueId _appInstanceId;

        private readonly object _lock = new object();

        private readonly HashSet<string> _loadingApps = new HashSet<string>();
        private readonly Dictionary<string, AppConnectionDescriptor> _appConnectionMap = new Dictionary<string, AppConnectionDescriptor>();

        private readonly BehaviorSubject<Unit> _updatedSubject = new BehaviorSubject<Unit>(Unit.Default);

        public AppConnectionsSet(UniqueId appInstanceId)
        {
            _appInstanceId = appInstanceId;
            UpdatedEventStream = _updatedSubject.ObserveOn(TaskPoolScheduler.Default);
        }

        public IObservable<Unit> UpdatedEventStream { get; }

        public void AppLaunched(IEnumerable<string> appIds)
        {
            var updated = false;
            lock (_lock)
            {
                foreach (var appId in appIds)
                {
                    if (!_appConnectionMap.ContainsKey(appId))
                    {
                        updated |= _loadingApps.Add(appId);
                    }
                }
            }

            if (updated)
            {
                _updatedSubject.OnNext(Unit.Default);
            }
        }

        public void AppConnected(AppConnectionDescriptor appConnection)
        {
            var updated = false;
            lock (_lock)
            {
                var appId = appConnection.ApplicationId;
                if (!_appConnectionMap.TryGetValue(appId, out var existingAppConnection) 
                    || !Equals(appConnection, existingAppConnection))
                {
                    _appConnectionMap[appId] = appConnection;
                    updated = true;
                }
                updated |= _loadingApps.Remove(appId);
            }

            if (updated)
            {
                _updatedSubject.OnNext(Unit.Default);
            }
        }

        public void AppDisconnected(AppConnectionDescriptor appConnection)
        {
            var updated = false;
            lock (_lock)
            {
                var appId = appConnection.ApplicationId;
                updated |= _appConnectionMap.Remove(appId);
                updated |= _loadingApps.Remove(appId);
            }

            if (updated)
            {
                _updatedSubject.OnNext(Unit.Default);
            }
        }

        public IReadOnlyCollection<AppConnectionDescriptor> GetOnlineConnections()
        {
            lock (_lock)
            {
                return _appConnectionMap.Values.Where(descriptor => descriptor != null).ToArray();
            }
        }

        public bool HasLoadingApps
        {
            get
            {
                lock (_lock)
                {
                    return _loadingApps.Any();
                }
            }
        }

        public IReadOnlyCollection<(UniqueId AppInstanceId, string AppId, Maybe<UniqueId> ConnectionId)> GetConnections(bool online)
        {
            lock (_lock)
            {
                var connections = online 
                    ? _appConnectionMap.Select(pair => (_appInstanceId, pair.Value.ApplicationId, new Maybe<UniqueId>(pair.Value.ConnectionId))) 
                    : _loadingApps.Select(appId => (_appInstanceId, appId, Maybe<UniqueId>.Nothing));
                return connections.Distinct().ToArray();
            }
        }
    }
}