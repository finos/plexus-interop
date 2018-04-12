/**
 * Copyright 2018 Plexus Interop Deutsche Bank AG
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
namespace Plexus
{
    using System;
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    internal sealed class Promise
    {
        private readonly Promise<Nothing> _inner = new Promise<Nothing>();

        public Task Task => _inner.Task;

        public bool TryComplete() => _inner.TryComplete(Nothing.Instance);

        public bool TryCancel() => _inner.TryCancel();

        public bool TryFail(Exception error) => _inner.TryFail(error);

        public bool TryFail(IEnumerable<Exception> errors) => _inner.TryFail(errors);

        public void PropagateCompletionFrom(Task task)
        {
            task.PropagateCompletionToPromise(this);
        }

        public CancellationTokenRegistration AssignCancellationToken(CancellationToken cancellationToken) =>
            _inner.AssignCancellationToken(cancellationToken);
    }
}