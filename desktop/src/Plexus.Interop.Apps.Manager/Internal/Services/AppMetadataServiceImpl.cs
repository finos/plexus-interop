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
namespace Plexus.Interop.Apps.Internal.Services
{
    using System;
    using System.Linq;
    using System.Reactive.Linq;
    using System.Reactive.Subjects;
    using System.Threading.Tasks;
    using Google.Protobuf.WellKnownTypes;
    using Plexus.Channels;
    using Plexus.Interop.Apps.Internal.Generated;
    using Plexus.Interop.Metamodel;

    internal class AppMetadataServiceImpl : IAppMetadataService
    {
        private readonly BehaviorSubject<IRegistry> _metamodelSubject;
        private readonly BehaviorSubject<AppRegistry> _appRegistrySubject;

        public AppMetadataServiceImpl(IAppRegistryProvider appRegistryProvider, IRegistryProvider registryProvider)
        {
            _appRegistrySubject = new BehaviorSubject<AppRegistry>(appRegistryProvider.Current);
            appRegistryProvider.Updated += registry => _appRegistrySubject.OnNext(registry);

            _metamodelSubject = new BehaviorSubject<IRegistry>(registryProvider.Current);
            registryProvider.Updated += registry => _metamodelSubject.OnNext(registry);
        }

        public async Task GetAppMetadataChangedEventStream(Empty request, IWritableChannel<AppMetadataChangedEvent> responseStream, MethodCallContext context)
        {
            await _appRegistrySubject.Select(ConvertToAppRegistryChangedEvent).PipeAsync(responseStream).ConfigureAwait(false);
        }

        public async Task GetMetamodelChangedEventStream(Empty request, IWritableChannel<MetamodelChangedEvent> responseStream, MethodCallContext context)
        {
            await _metamodelSubject.Select(ConvertToMetamodelChangedEvent).PipeAsync(responseStream).ConfigureAwait(false);
        }

        private static AppMetadataChangedEvent ConvertToAppRegistryChangedEvent(AppRegistry registry)
        {
            return new AppMetadataChangedEvent
            {
                Apps = { registry.Apps.Select(appInfo => new AppMetadataInfo
                {
                    Id = appInfo.Id,
                    DisplayName = appInfo.DisplayName,
                    LauncherId = appInfo.LauncherId,
                    LauncherParams = { appInfo.LauncherParams.Select(pair => new OptionParameter {Key = pair.Key, Value = pair.Value.ToString() })}
                })}
            };
        }

        private MetamodelChangedEvent ConvertToMetamodelChangedEvent(IRegistry registry)
        {
            return new MetamodelChangedEvent
            {
                Applications = { registry.Applications.Values.Select(ConvertToAppMetamodelInfo) },
                Services = { registry.Services.Values.Select(service => new Service
                {
                    Id = service.Id,
                    Methods = { service.Methods.Values.Select(method => new MethodInfo
                    {
                        Name = method.Name,
                        Type = ConvertToMethodType(method.Type),
                        RequestMessageId = method.InputMessage.Id,
                        ResponseMessageId = method.OutputMessage.Id,
                    })}
                })}
            };
        }

        internal static AppMetamodelInfo ConvertToAppMetamodelInfo(IApplication appInfo)
        {
            return new AppMetamodelInfo
            {
                Id = appInfo.Id,
                ConsumedServices = { appInfo.ConsumedServices.Select(service => new ConsumedService
                {
                    ServiceId = service.Service.Id,
                    Alias = service.Alias.GetValueOrDefault(string.Empty),
                    Methods = { service.Methods.Values.Select(method => new ConsumedMethod { Name = method.Method.Name })}
                }) },
                ProvidedServices = { appInfo.ProvidedServices.Select(service => new ProvidedService
                {
                    ServiceId = service.Service.Id,
                    Alias = service.Alias.GetValueOrDefault(string.Empty),
                    Methods = { service.Methods.Values.Select(method => new ProvidedMethod {
                        Name = method.Method.Name,
                        LaunchMode = ConvertLaunchMode(method.LaunchMode),
                        Title = method.Title.GetValueOrDefault(string.Empty),
                        TimeoutMs = method.TimeoutMs,
                        Options = { method.Options.Select(option => new OptionParameter { Key = option.Id, Value = option.Value})}
                    })}
                }) },
            };
        }

        private MethodInfo.Types.MethodType ConvertToMethodType(Metamodel.MethodType methodType)
        {
            switch (methodType)
            {
                case MethodType.Unary:
                    return MethodInfo.Types.MethodType.Unary;
                case MethodType.ServerStreaming:
                    return MethodInfo.Types.MethodType.ServerStreaming;
                case MethodType.ClientStreaming:
                    return MethodInfo.Types.MethodType.ClientStreaming;
                case MethodType.DuplexStreaming:
                    return MethodInfo.Types.MethodType.DuplexStreaming;
                default:
                    throw new ArgumentOutOfRangeException(nameof(methodType), methodType, null);
            }
        }

        private static ProvidedMethod.Types.MetamodelLaunchMode ConvertLaunchMode(Maybe<LaunchMode> methodLaunchMode)
        {
            switch (methodLaunchMode.GetValueOrDefault(LaunchMode.None))
            {
                case LaunchMode.None:
                    return ProvidedMethod.Types.MetamodelLaunchMode.None;
                case LaunchMode.SingleInstance:
                    return ProvidedMethod.Types.MetamodelLaunchMode.SingleInstance;
                case LaunchMode.MultiInstance:
                    return ProvidedMethod.Types.MetamodelLaunchMode.MultiInstance;
                default:
                    throw new ArgumentOutOfRangeException();
            }
        }
    }
}
