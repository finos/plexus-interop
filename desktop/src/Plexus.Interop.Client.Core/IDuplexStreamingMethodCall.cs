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
 namespace Plexus.Interop
{
    using Plexus.Channels;

    /// <inheritdoc />
    /// <summary>
    /// Return type for bidirectional streaming calls.
    /// </summary>
    /// <typeparam name="TRequest">Request message type for this call.</typeparam>
    /// <typeparam name="TResponse">Response message type for this call.</typeparam>
    public interface IDuplexStreamingMethodCall<in TRequest, TResponse> : IMethodCall, IContextAwareMethodCall<IDuplexStreamingMethodCall<TRequest, TResponse>>
    {
        /// <summary>
        /// Async stream to read streaming responses.
        /// </summary>
        IReadableChannel<TResponse> ResponseStream { get; }

        /// <summary>
        /// Async stream to send streaming requests.
        /// </summary>
        ITerminatableWritableChannel<TRequest> RequestStream { get; }
    }
}