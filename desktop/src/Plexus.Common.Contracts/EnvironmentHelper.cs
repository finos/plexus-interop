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
﻿namespace Plexus
{
    using System;

    public static class EnvironmentHelper
    {
        public const string BrokerWorkingDirVarName = "PLEXUS_BROKER_WORKING_DIR";
        public const string AppInstanceIdVarName = "PLEXUS_APP_INSTANCE_ID";
        public const string ParentProcessIdVarName = "PLEXUS_PARENT_PROCESS_ID";
        public const string PlexusTimeoutMultiplier = "PLEXUS_TIMEOUT_MULTIPLIER";

        public static string GetBrokerWorkingDir()
        {
            return Environment.GetEnvironmentVariable(BrokerWorkingDirVarName);
        }

        public static string GetBrokerWorkingDirOrThrow()
        {
            return GetBrokerWorkingDir() ?? throw new InvalidOperationException(
                       $"Expected environment variable {BrokerWorkingDirVarName} not set");
        }

        public static string GetAppInstanceId()
        {
            return Environment.GetEnvironmentVariable(AppInstanceIdVarName);
        }

        public static string GetParentProcessId()
        {
            return Environment.GetEnvironmentVariable(ParentProcessIdVarName);
        }

        public static double GetPlexusTimeoutMultiplier()
        {
            return double.TryParse(Environment.GetEnvironmentVariable(PlexusTimeoutMultiplier), out var multiplier)
                ? multiplier
                : 1;
        }
    }
}
