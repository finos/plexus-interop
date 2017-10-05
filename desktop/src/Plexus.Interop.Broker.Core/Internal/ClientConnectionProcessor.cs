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
namespace Plexus.Interop.Broker.Internal
{
    using Plexus.Channels;
    using Plexus.Interop.Transport;
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    internal sealed class ClientConnectionProcessor : IClientConnectionProcessor
    {
        private readonly ILogger _log;

        private readonly IClientConnection _connection;
        private readonly IClientRequestHandler _clientRequestHandler;
        private readonly HashSet<Task> _runnningTasks = new HashSet<Task>();

        public ClientConnectionProcessor(IClientConnection connection, IClientRequestHandler clientRequestHandler)
        {
            _connection = connection;
            Id = _connection.Id;
            _log = LogManager.GetLogger<ClientConnectionProcessor>(Id.ToString());
            _clientRequestHandler = clientRequestHandler;
            Completion = TaskRunner.RunInBackground(ProcessAsync);
        }

        public UniqueId Id { get; }

        public Task Completion { get; }

        private async Task ProcessAsync()
        {
            _log.Debug("Listening for connection requests: {0}", _connection);
            var listenChannelTask = _connection.IncomingChannels.ConsumeAsync((Action<ITransportChannel>)HandleChannel).IgnoreExceptions();
            lock (_runnningTasks)
            {
                _runnningTasks.Add(listenChannelTask);
            }
            await _connection.Completion.ConfigureAwait(false);
            Task completion;
            lock (_runnningTasks)
            {
                completion = Task.WhenAll(_runnningTasks);
            }
            await completion.ConfigureAwait(false);
            _log.Debug("Connection listening completed: {0}", _connection);
        }

        private void HandleChannel(ITransportChannel channel)
        {
            _log.Debug("Processing new channel {0} from connection {1}", channel.Id, _connection);
            var task = TaskRunner.RunInBackground(HandleChannelAsync, channel);
            lock (_runnningTasks)
            {
                _runnningTasks.Add(task);
            }
            task.ContinueWithSynchronously((Action<Task, object>)OnTaskCompleted, channel);
        }

        private async Task HandleChannelAsync(object state)
        {
            ITransportChannel channel = null;
            try
            {
                channel = (ITransportChannel)state;
                await _clientRequestHandler.HandleChannelAsync(_connection, channel).ConfigureAwait(false);
                _log.Debug("Channel {0} completed", channel.Id);
            }
            catch (Exception ex)
            {
                _log.Warn(ex, "Exception on handling channel {0}", channel?.Id);
            }
        }

        private void OnTaskCompleted(Task task, object state)
        {
            lock (_runnningTasks)
            {
                _runnningTasks.Remove(task);
            }
        }
    }
}
