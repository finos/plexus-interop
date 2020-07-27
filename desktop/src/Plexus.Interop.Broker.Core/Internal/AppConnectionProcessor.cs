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
namespace Plexus.Interop.Broker.Internal
{
    using Plexus.Channels;
    using Plexus.Interop.Transport;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Plexus.Interop.Apps;

    internal sealed class AppConnectionProcessor : IAppConnectionProcessor
    {
        private readonly ILogger _log;

        private readonly IAppConnection _connection;
        private readonly IClientRequestHandler _clientRequestHandler;
        private readonly Dictionary<ITransportChannel, Task> _handleChannelTasks = new Dictionary<ITransportChannel, Task>();

        public AppConnectionProcessor(IAppConnection connection, IClientRequestHandler clientRequestHandler)
        {
            _connection = connection;
            Id = _connection.Id;
            _log = LogManager.GetLogger<AppConnectionProcessor>(Id.ToString());
            _clientRequestHandler = clientRequestHandler;
        }

        public UniqueId Id { get; }

        public async Task ProcessAsync(Action connectionCompletedAction)
        {
            _log.Debug("Listening for incoming channels: {0}", _connection);
            var listenChannelTask = _connection.IncomingChannels.ConsumeAsync((Action<ITransportChannel>)HandleChannel).IgnoreExceptions();

            await listenChannelTask.ConfigureAwait(false);
            _log.Debug($"Listening for incoming channels completed: {_connection}");

            connectionCompletedAction();

            await _connection.Completion.ConfigureAwait(false);
            _log.Debug($"Connection completed: {_connection}");

            Task completion;
            lock (_handleChannelTasks)
            {
                completion = Task.WhenAll(_handleChannelTasks.Values);
                _log.Debug($"Waiting to completion of {_handleChannelTasks.Count} running channels ({string.Join(", ", _handleChannelTasks.Keys.Select(channel => channel.Id))}) tasks of {_connection}");
            }
            await completion.ConfigureAwait(false);
            _log.Debug($"Completed processing running tasks of connection {_connection}");
        }

        private void HandleChannel(ITransportChannel channel)
        {
            _log.Debug("Processing new channel {0} from connection {1}", channel.Id, _connection);
            var task = TaskRunner.RunInBackground(HandleChannelAsync, channel);
            lock (_handleChannelTasks)
            {
                _handleChannelTasks.Add(channel, task);
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
            var channel = (ITransportChannel)state;
            _log.Debug($"Completed processing of channel {channel.Id} from connection {_connection} in state {task.Status}");
            lock (_handleChannelTasks)
            {
                _handleChannelTasks.Remove(channel);
            }
        }
    }
}
