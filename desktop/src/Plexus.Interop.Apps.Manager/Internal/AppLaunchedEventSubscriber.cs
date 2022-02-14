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
namespace Plexus.Interop.Apps.Internal
{
    using System;
    using System.Linq;
    using System.Reactive.Linq;
    using System.Threading.Tasks;
    using Google.Protobuf.WellKnownTypes;
    using Plexus.Interop.Apps.Internal.Generated;
    using Plexus.Interop.Metamodel;
    using AppConnectionDescriptor = Plexus.Interop.Apps.AppConnectionDescriptor;
    using UniqueId = Plexus.UniqueId;

    internal class AppLaunchedEventSubscriber
    {
        private readonly IRegistryProvider _registryProvider;
        private readonly IAppLaunchedEventConsumer _appLaunchedEventConsumer;
        private readonly IAppLifecycleManagerClientClientRepository _lifecycleManagerClientRepo;
        private ILogger Log { get; } = LogManager.GetLogger<AppLaunchedEventSubscriber>();

        public AppLaunchedEventSubscriber(
            IAppLifecycleManager appConnectedEventProvider,
            IRegistryProvider registryProvider,
            IAppLaunchedEventConsumer appLaunchedEventConsumer,
            IAppLifecycleManagerClientClientRepository lifecycleManagerClientRepo)
        {
            _registryProvider = registryProvider;
            _appLaunchedEventConsumer = appLaunchedEventConsumer;
            _lifecycleManagerClientRepo = lifecycleManagerClientRepo;
            appConnectedEventProvider.ConnectionEventsStream
                .Where(ev => ev.Type == ConnectionEventType.AppConnected)
                .Select(ev => ev.Connection)
                .Subscribe(OnAppConnected);
        }

        private void OnAppConnected(AppConnectionDescriptor appConnectionDescriptor)
        {
            if (IsLauncher(appConnectionDescriptor, out var applicationId))
            {
                SubscribeToApplicationLaunchedEventStream(applicationId, appConnectionDescriptor.ConnectionId);
            }
        }

        private bool IsLauncher(AppConnectionDescriptor appConnectionDescriptor, out string applicationId)
        {
            applicationId = appConnectionDescriptor.ApplicationId;
            return _registryProvider.Current.Applications.TryGetValue(applicationId, out var application)
                && application.ProvidedServices.Any(service => service.Service.Id == AppLauncherService.Id);
        }

        private void SubscribeToApplicationLaunchedEventStream(string applicationId, UniqueId connectionId)
        {
            var appLauncherServiceId = AppLauncherService.Id;
            var appLaunchedEventStreamMethodId = AppLauncherService.AppLaunchedEventStreamMethodId;
            var methodCallDescriptor = ProvidedMethodReference.CreateWithConnectionId(appLauncherServiceId, appLaunchedEventStreamMethodId, applicationId, connectionId);

            _lifecycleManagerClientRepo.GetClientObservable()
                .Subscribe(client => SubscribeToLaunchedEventStream(client, connectionId, applicationId, methodCallDescriptor));
        }

        private void SubscribeToLaunchedEventStream(AppLifecycleManagerClient client, UniqueId connectionId, string applicationId, ProvidedMethodReference methodCallDescriptor)
        {
            Task.Factory.StartNew(async () =>
            {
                Log.Info($"Subscribing client '{client.ApplicationInstanceId}' to ApplicationLaunchedEventStream of {connectionId} application ({applicationId})");

                await client.CallInvoker
                    .CallServerStreaming<Empty, AppLaunchedEvent>(methodCallDescriptor.CallDescriptor, new Empty())
                    .ResponseStream.PipeAsync(_appLaunchedEventConsumer.AppLaunchedEventObserver).ConfigureAwait(false);
                Log.Info($"Subscription to ApplicationLaunchedEventStream of {connectionId} application ({applicationId}) have finished");
            }, TaskCreationOptions.LongRunning);
        }
    }
}
