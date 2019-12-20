/**
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
﻿namespace Plexus.Interop.Apps.Internal
{
    using Plexus.Channels;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;

    internal sealed class EventBroadcaster<T> : IDisposable
    {
        private static readonly ILogger Log = LogManager.GetLogger(typeof(EventBroadcaster<T>));

        private readonly HashSet<IWritableChannel<T>> _subscribers = new HashSet<IWritableChannel<T>>();

        private readonly CancellationTokenSource _cancellation = new CancellationTokenSource();
        private readonly Promise _completion = new Promise();

        public Task Subscribe(
            IWritableChannel<T> responseStream, MethodCallContext context)
        {            
            lock (_subscribers)
            {
                _subscribers.Add(responseStream);
            }
            Log.Info("Lifecycle events subscriber added: {{{0}}}", context);
            using (context.CancellationToken.Register(() =>
            {
                lock (_subscribers)
                {
                    _subscribers.Remove(responseStream);
                }
                Log.Info("Lifecycle events subscriber removed: {{{0}}}", context);
            }))
            {
            }
            return _completion.Task;
        }

        public void BroadcastEvent(T evt)
        {
            IWritableChannel<T>[] subscribers;
            lock (_subscribers)
            {
                subscribers = _subscribers.ToArray();
            }
            if (subscribers.Length > 0)
            {
                TaskRunner.RunInBackground(
                    () => BroadcastEventAsync(evt, subscribers),
                    _cancellation.Token);
            }
        }

        private async Task BroadcastEventAsync(
            T evt,
            IReadOnlyCollection<IWritableChannel<T>> subscribers)
        {            
            try
            {
                Log.Info("Broadcasting event to {0} subscribers: {1}", subscribers.Count, evt);
                await Task
                    .WhenAll(subscribers.Select(x =>
                        x.TryWriteAsync(evt, _cancellation.Token).IgnoreCancellation(_cancellation.Token)))
                    .ConfigureAwait(false);
                Log.Info("Event broadcasted to {0} subscribers: {1}", subscribers.Count, evt);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Exception while broadcasting lifecycle event");
            }
        }

        public void Dispose()
        {
            _cancellation.Cancel();
            _completion.TryComplete();
        }
    }
}
