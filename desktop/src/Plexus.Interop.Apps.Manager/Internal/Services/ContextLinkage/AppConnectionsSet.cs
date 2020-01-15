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
namespace Plexus.Interop.Apps.Internal.Services.ContextLinkage
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Reactive.Linq;
    using System.Reactive.Subjects;

    internal class AppConnectionsSet
    {
        private readonly UniqueId _appInstanceId;

        private readonly object _lock = new object();

        private readonly HashSet<string> _loadingApps = new HashSet<string>();
        private readonly Dictionary<string, AppConnectionDescriptor> _appConnectionMap = new Dictionary<string, AppConnectionDescriptor>();

        private readonly BehaviorSubject<bool> _loadingStatusSubject = new BehaviorSubject<bool>(false);

        public IObservable<bool> IsLoadingStatus { get; }

        public AppConnectionsSet(UniqueId appInstanceId)
        {
            _appInstanceId = appInstanceId;
            IsLoadingStatus = _loadingStatusSubject.DistinctUntilChanged();
        }

        public void AppLaunched(IEnumerable<string> appIds)
        {
            bool newLoadingStatus;
            lock (_lock)
            {
                foreach (var appId in appIds)
                {
                    if (!_appConnectionMap.ContainsKey(appId))
                    {
                        _loadingApps.Add(appId);
                    }
                }

                newLoadingStatus = _loadingApps.Count > 0;
            }

            _loadingStatusSubject.OnNext(newLoadingStatus);
        }

        public void AppConnected(AppConnectionDescriptor appConnection)
        {
            bool newLoadingStatus;
            lock (_lock)
            {
                var appId = appConnection.ApplicationId;
                _appConnectionMap[appId] = appConnection;
                _loadingApps.Remove(appId);
                newLoadingStatus = _loadingApps.Count > 0;
            }

            _loadingStatusSubject.OnNext(newLoadingStatus);
        }

        public void AppDisconnected(AppConnectionDescriptor appConnection)
        {
            bool newLoadingStatus;
            lock (_lock)
            {
                var appId = appConnection.ApplicationId;
                _appConnectionMap.Remove(appId);
                _loadingApps.Remove(appId);
                newLoadingStatus = _loadingApps.Count > 0;
            }

            _loadingStatusSubject.OnNext(newLoadingStatus);
        }

        public IReadOnlyCollection<AppConnectionDescriptor> GetOnlineConnections()
        {
            lock (_lock)
            {
                return _appConnectionMap.Values.Where(descriptor => descriptor != null).ToArray();
            }
        }

        public IReadOnlyCollection<(UniqueId AppInstanceId, string AppId, Maybe<UniqueId> ConnectionId)> GetAllApps()
        {
            lock (_lock)
            {
                return _appConnectionMap.Select(pair =>
                        (_appInstanceId, pair.Value.ApplicationId, new Maybe<UniqueId>(pair.Value.ConnectionId)))
                    .Concat(_loadingApps.Select(appId => (_appInstanceId, appId, Maybe<UniqueId>.Nothing)))
                    .Distinct().ToArray();
            }
        }
    }
}