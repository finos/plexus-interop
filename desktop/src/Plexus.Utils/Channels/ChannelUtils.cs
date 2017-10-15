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
 using System;
using System.Threading.Tasks;

namespace Plexus.Channels
{
    public static class ChannelUtils
    {
        public static void PropagateTerminationFrom(this ITerminatableChannel channel, Task completion)
        {
            void OnCompleted(Task task, object state)
            {
                var c = (ITerminatableChannel)state;
                if (task.IsFaulted)
                {
                    c.TryTerminateWriting(task.Exception.ExtractInner());
                }
                else if (task.IsCanceled)
                {
                    c.TryTerminateWriting();
                }
            }

            completion.ContinueWithSynchronously((Action<Task, object>)OnCompleted, channel);
        }

        public static void PropagateCompletionFrom<T>(this IWritableChannel<T> channel, Task completion)
        {
            void OnCompleted(Task task, object state)
            {
                var c = (IWritableChannel<T>)state;
                if (task.IsFaulted)
                {
                    c.TryTerminateWriting(task.Exception.ExtractInner());
                }
                else if (task.IsCanceled)
                {
                    c.TryTerminateWriting();
                }
                else
                {
                    c.TryCompleteWriting();
                }
            }

            Task.WhenAny(completion, channel.Completion).ContinueWithSynchronously((Action<Task, object>)OnCompleted, channel);
        }

        public static void PropagateExceptionFrom<T>(this IWritableChannel<T> channel, Task completion)
        {
            void OnCompleted(Task task, object state)
            {
                var c = (IWritableChannel<T>)state;
                if (task.IsFaulted)
                {
                    c.TryTerminateWriting(task.Exception.ExtractInner());
                }
                else if (task.IsCanceled)
                {
                    c.TryTerminateWriting();
                }
            }

            Task.WhenAny(channel.Completion, completion).ContinueWithSynchronously((Action<Task, object>)OnCompleted, channel);
        }
    }
}
