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
    using System.Reactive.Concurrency;
    using System.Reactive.Linq;
    using System.Reactive.Subjects;

    internal class ContextsSet
    {
        private readonly IAppLifecycleManager _appLifecycleManager;
        private readonly Subject<AppContextBindingEvent> _appContextBindingSubject = new Subject<AppContextBindingEvent>();

        public ContextsSet(IAppLifecycleManager appLifecycleManager)
        {
            _appLifecycleManager = appLifecycleManager;
            AppContextBindingEvents = _appContextBindingSubject.ObserveOn(TaskPoolScheduler.Default);
        }

        public IObservable<AppContextBindingEvent> AppContextBindingEvents { get; }

        public Context CreateContext()
        {
            var context = new Context(_appLifecycleManager);
            _contexts[context.Id] = context;
            context.AppContextBindings.Subscribe(BindContext);
            return context;
        }

        public IReadOnlyCollection<Context> GetContextsOf(UniqueId appInstanceId)
        {
            lock (_lock)
            {
                if (_contextsOfAppInstance.TryGetValue(appInstanceId, out var contexts))
                {
                    return contexts.ToArray();
                }
            }
            return new Context[0];
        }

        private readonly object _lock = new object();

        private readonly Dictionary<UniqueId, HashSet<Context>> _contextsOfAppInstance = new Dictionary<UniqueId, HashSet<Context>>();
        private readonly Dictionary<string, Context> _contexts = new Dictionary<string, Context>();

        public Context GetContext(string contextId)
        {
            lock (_lock)
            {
                _contexts.TryGetValue(contextId, out var context);
                return context;
            }
        }

        private void BindContext(AppContextBindingEvent bindingEvent)
        {
            var appInstanceId = bindingEvent.AppInstanceId;
            var context = bindingEvent.Context;
            lock (_lock)
            {
                if (!_contextsOfAppInstance.TryGetValue(appInstanceId, out var contexts))
                {
                    contexts = new HashSet<Context>();
                    _contextsOfAppInstance[appInstanceId] = contexts;
                }

                if (contexts.Add(context))
                {
                    _appContextBindingSubject.OnNext(bindingEvent);
                }
            }
        }

        public IReadOnlyCollection<Context> GetAllContexts()
        {
            lock (_lock)
            {
                return _contexts.Values.ToArray();
            }
        }
    }
}