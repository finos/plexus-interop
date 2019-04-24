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
namespace Plexus.Interop.Transport
{
    using System;
    using System.Diagnostics;
    using System.IO;
    using System.Linq;
    using System.Text;
    using System.Threading;
    using System.Threading.Tasks;

    public sealed class ServerStateReader : IServerStateReader
    {
        private const string ReadyMarker = "ready";
        private static readonly TimeSpan PollPeriod = TimeoutConstants.Timeout250Ms;        
        private static readonly ILogger Log = LogManager.GetLogger<ServerStateReader>();

        private readonly string _eventName;
        private readonly string _settingsDir;
        private readonly string _lockFilePath;

        public ServerStateReader(string serverName, string brokerWorkingDir)
        {
            brokerWorkingDir = Path.GetFullPath(brokerWorkingDir ?? Directory.GetCurrentDirectory());
            _eventName = ServerStateUtils.GetServerIntiializationEventName(serverName, brokerWorkingDir);
            _settingsDir = ServerStateUtils.GetServerSettingsDirectory(serverName, brokerWorkingDir);
            _lockFilePath = Path.Combine(_settingsDir, "lock");
        }

        public async Task<bool> WaitInitializationAsync(TimeSpan timeout, CancellationToken cancellationToken)
        {
            Log.Debug("Waiting initialization {0}", _eventName);
            using (var waitHandle = new EventWaitHandle(false, EventResetMode.ManualReset, _eventName))
            {
                var waitHandleTimeout = WaitHandleTimeout(waitHandle, timeout, cancellationToken);
                var pollFileTimeout = PollFileTimeout(timeout, cancellationToken);
                var firstCompleted = await Task.WhenAny(waitHandleTimeout, pollFileTimeout).ConfigureAwait(false);
                if (firstCompleted.GetResult())
                {
                    return true;
                }
                var allCompleted = await Task.WhenAll(waitHandleTimeout, pollFileTimeout).ConfigureAwait(false);
                cancellationToken.ThrowIfCancellationRequested();
                return allCompleted.Any(x => x);
            }
        }

        public string ReadSetting(string key)
        {
            var file = Path.Combine(_settingsDir, key);
            var repeat = 10;
            while (!File.Exists(file) && repeat-- > 0)
            {
                Task.Delay(100).GetResult();
            }
            return File.Exists(file) ? File.ReadAllText(file, Encoding.UTF8) : null;
        }

        private async Task<bool> PollFileTimeout(TimeSpan timeout, CancellationToken cancellationToken)
        {
            var stopwatch = new Stopwatch();
            stopwatch.Start();
            while (!IsFileLocked(_lockFilePath) && stopwatch.Elapsed <= timeout)
            {
                await Task.Delay(PollPeriod, cancellationToken);
            }
            while (!string.Equals(ReadyMarker, TryReadFromFile(_lockFilePath), StringComparison.InvariantCultureIgnoreCase) && stopwatch.Elapsed <= timeout)
            {
                await Task.Delay(PollPeriod, cancellationToken);
            }
            return stopwatch.Elapsed <= timeout;
        }

        private static string TryReadFromFile(string path)
        {
            try
            {
                using (var reader =
                    new StreamReader(File.Open(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite),
                        Encoding.UTF8))
                {
                    return reader.ReadToEnd();
                }
            }
            catch
            {
                return null;
            }
        }

        private static bool IsFileLocked(string path)
        {
            try
            {
                using (File.Open(path, FileMode.Open, FileAccess.ReadWrite, FileShare.Read))
                {
                }
            }
            catch (IOException)
            {
                return true;
            }
            catch
            {
                // file does not exist yet or cannot be open by some other reason
            }
            return false;
        }

        private static async Task<bool> WaitHandleTimeout(WaitHandle handle, TimeSpan timeout, CancellationToken cancellationToken)
        {
            var alreadySignaled = handle.WaitOne(0);
            if (alreadySignaled)
            {
                return true;
            }
            if (timeout == TimeSpan.Zero)
            {
                return false;
            }
            var tcs = new TaskCompletionSource<bool>();
            using (cancellationToken.Register(() => tcs.TrySetCanceled(), false))
            {
                var threadPoolRegistration = ThreadPool.RegisterWaitForSingleObject(
                    handle,
                    (state, timedOut) => ((TaskCompletionSource<bool>) state).TrySetResult(!timedOut),
                    tcs,
                    timeout,
                    true);
                try
                {
                    return await tcs.Task.ConfigureAwait(false);
                }
                finally
                {
                    threadPoolRegistration.Unregister(handle);
                }
            }
        }
    }
}
