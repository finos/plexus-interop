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
﻿namespace Plexus.Interop.Broker.Internal
{
    using Plexus.Interop.Metamodel;
    using Plexus.Interop.Protocol;
    using System;
    using System.Collections.Concurrent;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading;

    internal sealed class RegistryService : IRegistryService, IDisposable
    {
        private static readonly ILogger Log = LogManager.GetLogger<RegistryService>();

        private readonly ReaderWriterLockSlim _registryLock = new ReaderWriterLockSlim(LockRecursionPolicy.SupportsRecursion);

        private readonly ConcurrentDictionary<IApplication, IReadOnlyCollection<IProvidedMethod>> _matchingProvidedMethodsCache
            = new ConcurrentDictionary<IApplication, IReadOnlyCollection<IProvidedMethod>>();

        private readonly ConcurrentDictionary<IApplication, IReadOnlyCollection<IConsumedMethod>> _matchingConsumedMethodsCache
            = new ConcurrentDictionary<IApplication, IReadOnlyCollection<IConsumedMethod>>();

        private IRegistry _registry;
        private readonly IRegistryProvider _registryProvider;

        public RegistryService(IRegistryProvider registryProvider)
        {
            _registryProvider = registryProvider;            
            _registryProvider.Updated += OnUpdated;
            if (_registry == null)
            {
                OnUpdated(_registryProvider.Current);
            }
        }

        private void OnUpdated(IRegistry registry)
        {
            _registryLock.EnterWriteLock();
            try
            {
                Log.Info("Metadata changed. Reloading.");
                _registry = registry;
                _matchingProvidedMethodsCache.Clear();
            }
            finally
            {
                _registryLock.ExitWriteLock();
            }
        }

        internal IRegistry Registry => _registryProvider.Current;

        public IApplication GetApplication(string appId)
        {
            _registryLock.EnterReadLock();
            try
            {
                return _registry.Applications[appId];
            }
            finally
            {
                _registryLock.ExitReadLock();
            }
        }

        public IConsumedService GetConsumedService(string appId, IConsumedServiceReference reference)
        {
            _registryLock.EnterReadLock();
            try
            {
                return _registry.Applications[appId].ConsumedServices
                    .FirstOrDefault(x =>
                        Equals(x.Service.Id, reference.ServiceId) && Equals(x.Alias, reference.ServiceAlias));
            }
            finally
            {
                _registryLock.ExitReadLock();
            }
        }

        public IConsumedMethod GetConsumedMethod(string appId, IConsumedMethodReference reference)
        {
            _registryLock.EnterReadLock();
            try
            {
                var service = GetConsumedService(appId, reference.ConsumedService);
                return service.Methods[reference.MethodId];
            }
            finally
            {
                _registryLock.ExitReadLock();
            }
        }

        public IProvidedService GetProvidedService(IProvidedServiceReference reference)
        {
            _registryLock.EnterReadLock();
            try
            {
                return _registry.Applications[reference.ApplicationId].ProvidedServices
                    .FirstOrDefault(x =>
                        Equals(x.Alias, reference.ServiceAlias) && Equals(x.Service.Id, reference.ServiceId));
            }
            finally
            {
                _registryLock.ExitReadLock();
            }
        }

        public IProvidedMethod GetProvidedMethod(IProvidedMethodReference reference)
        {
            _registryLock.EnterReadLock();
            try
            {
                return GetProvidedService(reference.ProvidedService).Methods[reference.MethodId];
            }
            finally
            {
                _registryLock.ExitReadLock();
            }
        }

        public IReadOnlyCollection<IProvidedMethod> GetMatchingProvidedMethods(IConsumedMethod consumedMethod)
        {            
            _registryLock.EnterReadLock();
            try
            {
                return GetMatchingProvidedMethods(consumedMethod.ConsumedService.Application)
                    .Where(x => Equals(x.Method, consumedMethod.Method))
                    .ToList();
            }
            finally
            {
                _registryLock.ExitReadLock();
            }
        }

        public IReadOnlyCollection<IProvidedMethod> GetMatchingProvidedMethods(string appId, IConsumedMethodReference reference)
        {
            _registryLock.EnterReadLock();
            try
            {
                return GetMatchingProvidedMethods(GetConsumedMethod(appId, reference));
            }
            finally
            {
                _registryLock.ExitReadLock();
            }
        }

        public IReadOnlyCollection<IProvidedMethod> GetMatchingProvidedMethods(IApplication application)
        {
            IReadOnlyCollection<IProvidedMethod> GetMatchingProvidedMethodsInternal(IApplication a)
            {
                var all = _registry.Applications.Values.SelectMany(x => x.ProvidedServices);
                var matched = application.ConsumedServices
                    .Join(all, x => x.Service, y => y.Service, (consumed, provided) => (consumed, provided))
                    .Where(x =>
                        x.provided.To.IsMatch(x.consumed.Application.Id) &&
                        x.consumed.From.IsMatch(x.provided.Application.Id))
                    .SelectMany(x =>
                        x.consumed.Methods.Values
                            .Join(x.provided.Methods.Values, c => c.Method, p => p.Method, (c, p) => p))
                    .Distinct();                
                return matched.ToList();
            }

            _registryLock.EnterReadLock();
            try
            {
                return _matchingProvidedMethodsCache.GetOrAdd(application, GetMatchingProvidedMethodsInternal);
            }
            finally
            {
                _registryLock.ExitReadLock();
            }
        }

        public IReadOnlyCollection<IProvidedMethod> GetMatchingProvidedMethods(string appId)
        {
            _registryLock.EnterReadLock();
            try
            {
                return GetMatchingProvidedMethods(GetApplication(appId));
            }
            finally
            {
                _registryLock.ExitReadLock();
            }
        }

        public bool IsApplicationDefined(string appId)
        {
            return _registry.Applications.ContainsKey(appId);
        }

        public IReadOnlyCollection<IConsumedMethod> GetMatchingConsumedMethods(IApplication application)
        {
            IReadOnlyCollection<IConsumedMethod> GetMatchingConsumedMethodsInternal(IApplication a)
            {
                var all = _registry.Applications.Values.SelectMany(x => x.ConsumedServices);
                var matched = a.ProvidedServices
                    .Join(all, x => x.Service, y => y.Service, (provided, consumed) => (provided, consumed))
                    .Where(x =>
                        x.consumed.From.IsMatch(x.provided.Application.Id) &&
                        x.provided.To.IsMatch(x.consumed.Application.Id))
                    .SelectMany(x =>
                        x.consumed.Methods.Values
                            .Join(x.provided.Methods.Values, c => c.Method, p => p.Method, (c, p) => c))
                    .Distinct();
                return matched.ToList();
            }

            _registryLock.EnterReadLock();
            try
            {
                return _matchingConsumedMethodsCache.GetOrAdd(application, GetMatchingConsumedMethodsInternal);
            }
            finally
            {
                _registryLock.ExitReadLock();
            }
        }

        public IReadOnlyCollection<(IConsumedMethod Consumed, IProvidedMethod Provided)> GetMethodMatches(string appId, IConsumedServiceReference consumedServiceReference)
        {
            _registryLock.EnterReadLock();
            try
            {
                var consumedService = GetConsumedService(appId, consumedServiceReference);
                return GetMatchingProvidedMethods(consumedService.Application)
                    .Join(consumedService.Methods.Values, x => x.Method, y => y.Method, (x, y) => (y, x))
                    .Distinct()
                    .ToList();
            }
            finally
            {
                _registryLock.ExitReadLock();
            }
        }

        public IReadOnlyCollection<(IConsumedMethod Consumed, IProvidedMethod Provided)> GetMethodMatches(string appId)
        {
            _registryLock.EnterReadLock();
            try
            {
                var app = GetApplication(appId);
                var consumedMethods = app.ConsumedServices.SelectMany(x => x.Methods.Values);
                return GetMatchingProvidedMethods(appId)
                    .Join(consumedMethods, x => x.Method, y => y.Method, (x, y) => (y, x))
                    .Distinct()
                    .ToList();
            }
            finally
            {
                _registryLock.ExitReadLock();
            }
        }

        public void Dispose()
        {
            _registryProvider.Updated -= OnUpdated;
        }
    }
}
