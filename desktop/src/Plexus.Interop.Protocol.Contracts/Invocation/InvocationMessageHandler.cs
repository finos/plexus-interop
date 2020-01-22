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
﻿namespace Plexus.Interop.Protocol.Invocation
{
    using System;

    public struct InvocationMessageHandler<T, TArgs>
    {
        private readonly Func<IInvocationMessageHeader, TArgs, T> _messageHandler;
        private readonly Func<IInvocationMessageReceived, TArgs, T> _confirmationHandler;
        private readonly Func<IInvocationSendCompleted, TArgs, T> _sendCompletedHandler;

        public InvocationMessageHandler(
            Func<IInvocationMessageHeader, TArgs, T> messageHandler,
            Func<IInvocationMessageReceived, TArgs, T> confirmationHandler,
            Func<IInvocationSendCompleted, TArgs, T> sendCompletedHandler)
        {
            _messageHandler = messageHandler;
            _confirmationHandler = confirmationHandler;
            _sendCompletedHandler = sendCompletedHandler;
        }

        public T Handle(IInvocationMessageHeader header, TArgs args)
        {
            return _messageHandler(header, args);
        }

        public T Handle(IInvocationMessageReceived header, TArgs args)
        {
            return _confirmationHandler(header, args);
        }

        public T Handle(IInvocationSendCompleted header, TArgs args)
        {
            return _sendCompletedHandler(header, args);
        }
    }
}
