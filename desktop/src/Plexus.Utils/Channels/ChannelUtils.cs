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
namespace Plexus.Channels
{
    using System;
    using System.Threading.Tasks;

    internal static class ChannelUtils
    {
        public static void PropagateTerminationFrom<T>(this ITerminatableWritableChannel<T> channel, Task completion)
        {
            completion.SuppressUnobservedExceptions();

            void OnCompleted(Task task, object state)
            {
                var c = (ITerminatableWritableChannel<T>)state;
                if (task.IsFaulted)
                {
                    c.TryTerminate(task.Exception.ExtractInner());
                }
                else if (task.IsCanceled)
                {
                    c.TryTerminate();
                }
            }
            
            Task.WhenAny(channel.Completion, completion).Unwrap().ContinueWithSynchronously((Action<Task, object>)OnCompleted, channel);
        }

        public static void PropagateCompletionFrom<T>(this ITerminatableWritableChannel<T> channel, Task completion)
        {
            completion.SuppressUnobservedExceptions();

            void OnCompleted(Task task, object state)
            {
                var c = (ITerminatableWritableChannel<T>)state;
                if (task.IsFaulted)
                {
                    c.TryTerminate(task.Exception.ExtractInner());
                }
                else if (task.IsCanceled)
                {
                    c.TryTerminate();
                }
                else
                {
                    c.TryComplete();
                }
            }

            Task.WhenAny(channel.Completion, completion).Unwrap().ContinueWithSynchronously((Action<Task, object>)OnCompleted, channel);
        }

        public static void PropagateExceptionFrom<T>(this ITerminatableWritableChannel<T> channel, Task completion)
        {
            completion.SuppressUnobservedExceptions();

            void OnCompleted(Task task, object state)
            {
                var c = (ITerminatableWritableChannel<T>)state;
                if (task.IsFaulted)
                {
                    c.TryTerminate(task.Exception.ExtractInner());
                }
                else if (task.IsCanceled)
                {
                    c.TryTerminate();
                }
            }

            Task.WhenAny(channel.Completion, completion).Unwrap().ContinueWithSynchronously((Action<Task, object>)OnCompleted, channel);
        }
    }
}
