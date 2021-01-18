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
namespace Plexus.Interop.Apps.Internal.Services.ContextLinkage
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Reactive;
    using System.Reactive.Linq;
    using System.Reactive.Subjects;

    internal class Context
    {
        private readonly IAppLifecycleManager _appLifecycleManager;

        public string Id { get; } = Guid.NewGuid().ToString();

        private readonly object _lock = new object();

        private readonly Dictionary<UniqueId, AppConnectionsSet> _appInstanceIdsToConnections = new Dictionary<UniqueId, AppConnectionsSet>();

        private readonly Subject<AppContextBindingEvent> _bindingSubject = new Subject<AppContextBindingEvent>();
        private readonly BehaviorSubject<Unit> _contextUpdatedSubject = new BehaviorSubject<Unit>(Unit.Default);

        public Context(IAppLifecycleManager appLifecycleManager)
        {
            _appLifecycleManager = appLifecycleManager;
            AppContextBindings = _bindingSubject;
            ContextUpdatedEventStream = _contextUpdatedSubject;
        }
        
        public IObservable<AppContextBindingEvent> AppContextBindings { get; }
        public IObservable<Unit> ContextUpdatedEventStream { get; }

        public void AppLaunched(UniqueId appInstanceId, IEnumerable<string> appIds)
        {
            _bindingSubject.OnNext(new AppContextBindingEvent(this, appInstanceId));
            var appConnectionsSet = GetOrCreateAppConnectionsSet(appInstanceId);
            appConnectionsSet.AppLaunched(appIds);

            foreach (var appConnection in _appLifecycleManager.GetAppInstanceConnections(appInstanceId))
            {
                AppConnected(appConnection.Info);
            }
        }

        public void AppConnected(AppConnectionDescriptor appConnection)
        {
            _bindingSubject.OnNext(new AppContextBindingEvent(this, appConnection.ApplicationInstanceId));
            var appConnectionsSet = GetOrCreateAppConnectionsSet(appConnection.ApplicationInstanceId);
            appConnectionsSet.AppConnected(appConnection);
        }

        public void AppDisconnected(AppConnectionDescriptor appConnection)
        {
            lock (_lock)
            {
                if (_appInstanceIdsToConnections.TryGetValue(appConnection.ApplicationInstanceId, out var appConnectionsSet))
                {
                    appConnectionsSet.AppDisconnected(appConnection);
                }
            }
        }

        private AppConnectionsSet GetOrCreateAppConnectionsSet(UniqueId appInstanceId)
        {
            AppConnectionsSet appConnectionsSet;
            lock (_lock)
            {
                if (!_appInstanceIdsToConnections.TryGetValue(appInstanceId, out appConnectionsSet))
                {
                    appConnectionsSet = new AppConnectionsSet(appInstanceId);
                    appConnectionsSet.UpdatedEventStream.Subscribe(AppConnectionUpdated);
                    _appInstanceIdsToConnections[appInstanceId] = appConnectionsSet;
                }
            }

            return appConnectionsSet;
        }

        private void AppConnectionUpdated(Unit unit)
        {
            _contextUpdatedSubject.OnNext(unit);
        }

        public IReadOnlyCollection<AppConnectionDescriptor> GetConnectedApps()
        {
            lock (_lock)
            {
                return _appInstanceIdsToConnections.Values.SelectMany(connections => connections.GetOnlineConnections()).ToArray();
            }
        }

        public bool IsLoading
        {
            get
            {
                lock (_lock)
                {
                    return _appInstanceIdsToConnections.Values.Any(connectionsSet => connectionsSet.HasLoadingApps);
                }
            }
        }

        public IReadOnlyCollection<(UniqueId AppInstanceId, string AppId, Maybe<UniqueId> ConnectionId)> GetAppsInContext(bool online)
        {
            lock (_lock)
            {
                return _appInstanceIdsToConnections.Values.SelectMany(set => set.GetConnections(online)).ToArray();
            }
        }
    }
}