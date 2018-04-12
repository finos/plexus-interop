/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
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
﻿namespace Plexus.Interop.Transport
{
    using System.IO;
    using System.Text;
    using System.Threading;

    public sealed class ServerStateWriter : IServerStateWriter
    {
        private static readonly ILogger Log = LogManager.GetLogger<ServerStateWriter>();

        private int _disposed;
        private readonly DirectoryInfo _settingsDir;
        private readonly EventWaitHandle _waitHandle;
        private readonly string _eventName;

        public ServerStateWriter(string serverName, string workingDir = null)
        {
            workingDir = Path.GetFullPath(workingDir ?? Directory.GetCurrentDirectory());
            _eventName = ServerStateUtils.GetServerIntiializationEventName(serverName, workingDir);
            _settingsDir = new DirectoryInfo(ServerStateUtils.GetServerSettingsDirectory(serverName, workingDir));
            _waitHandle = new EventWaitHandle(false, EventResetMode.ManualReset, _eventName);
            _waitHandle.Reset();
            Cleanup();
        }

        public void SignalInitialized()
        {
            Log.Debug("Signalling initialization {0}", _eventName);
            _waitHandle.Set();
        }

        public void Write(string key, string value)
        {
            _settingsDir.Create();
            var filePath = Path.Combine(_settingsDir.FullName, key);
            File.WriteAllText(filePath, value, Encoding.UTF8);
        }

        public void Dispose()
        {
            if (Interlocked.Exchange(ref _disposed, 1) == 1)
            {
                return;
            }
            _waitHandle.Reset();
            _waitHandle.Dispose();
            Cleanup();
        }

        private void Cleanup()
        {
            try
            {
                if (_settingsDir.Exists)
                {
                    _settingsDir.Delete(true);
                }
            }
            catch
            {
                // ignore
            }
        }
    }
}
