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
﻿namespace Plexus.Host.Internal
{
    using System;
    using System.Diagnostics;
    using System.IO;
    using System.Text;
    using System.Threading;

    internal sealed class LockFile : IDisposable
    {
        private readonly string _lockFileContent;
        private FileStream _fileStream;

        public LockFile(string lockFileName, string lockFileContent)
        {
            Name = lockFileName;
            _lockFileContent = lockFileContent;
        }

        public string Name { get; }

        public bool TryEnter(int timeoutMs)
        {
            var stopwatch = new Stopwatch();
            stopwatch.Start();
            do
            {
                try
                {
                    _fileStream = new FileStream(Name, FileMode.OpenOrCreate, FileAccess.ReadWrite, FileShare.Read);
                    var bytes = Encoding.UTF8.GetBytes(_lockFileContent);
                    _fileStream.Write(bytes, 0, bytes.Length);
                    _fileStream.Flush(true);
                }
                catch
                {
                    Thread.Sleep(50);
                }
            } while (_fileStream == null && stopwatch.ElapsedMilliseconds < timeoutMs);
            stopwatch.Stop();
            return _fileStream != null;
        }

        public void Release()
        {
            if (_fileStream == null)
            {
                return;
            }
            _fileStream.Dispose();
            try
            {
                if (File.Exists(Name))
                {
                    File.Delete(Name);
                }
            }
            catch
            {
                // ignore
            }
        }

        public void Dispose()
        {
            Release();
        }
    }
}
