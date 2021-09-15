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
namespace Plexus.Interop.Apps.Internal.Services
{
    using System.Threading.Tasks;
    using Plexus.Interop;
    using Plexus.Interop.Apps.Internal.Generated;

    internal class AppRegistrationServiceImpl : AppLifecycleManagerClient.IAppRegistrationServiceImpl
    {
        private readonly IAppLifecycleManager _appLifecycleManager;

        public AppRegistrationServiceImpl(IAppLifecycleManager appLifecycleManager)
        {
            _appLifecycleManager = appLifecycleManager;
        }

        public Task<RegisterInstanceIdResponse> RegisterInstanceId(RegisterInstanceIdRequest request, MethodCallContext context)
        {
            RegisterInstanceId(request.ApplicationId, request.AppInstanceId.ToUniqueId());
            return Task.FromResult(new RegisterInstanceIdResponse());
        }

        public Task<UniqueId> RequestInstanceId(RequestInstanceIdRequest request, MethodCallContext context)
        {
            var appInstanceId = Plexus.UniqueId.Generate();
            RegisterInstanceId(request.ApplicationId, appInstanceId);
            return Task.FromResult(appInstanceId.ToProto());
        }

        private void RegisterInstanceId(string applicationId, Plexus.UniqueId appInstanceId)
            => _appLifecycleManager.RegisterAppInstanceConnection(applicationId, appInstanceId);
    }
}
