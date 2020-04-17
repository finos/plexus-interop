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
 namespace Plexus.Interop
{
    using System.Threading.Tasks;
    using Plexus.Channels;

    /// <summary>
    /// Server-side handler for unary call.
    /// </summary>
    /// <typeparam name="TRequest">Request message type for this method.</typeparam>
    /// <typeparam name="TResponse">Response message type for this method.</typeparam>
    public delegate Task<TResponse> UnaryMethodHandler<in TRequest, TResponse>(TRequest request, MethodCallContext context);

    /// <summary>
    /// Server-side handler for client streaming call.
    /// </summary>
    /// <typeparam name="TRequest">Request message type for this method.</typeparam>
    /// <typeparam name="TResponse">Response message type for this method.</typeparam>
    public delegate Task<TResponse> ClientStreamingMethodHandler<TRequest, TResponse>(IReadableChannel<TRequest> requestStream, MethodCallContext context);

    /// <summary>
    /// Server-side handler for server streaming call.
    /// </summary>
    /// <typeparam name="TRequest">Request message type for this method.</typeparam>
    /// <typeparam name="TResponse">Response message type for this method.</typeparam>
    public delegate Task ServerStreamingMethodHandler<in TRequest, out TResponse>(TRequest request, IWritableChannel<TResponse> responseStream, MethodCallContext context);

    /// <summary>
    /// Server-side handler for duplex streaming call.
    /// </summary>
    /// <typeparam name="TRequest">Request message type for this method.</typeparam>
    /// <typeparam name="TResponse">Response message type for this method.</typeparam>
    public delegate Task DuplexStreamingMethodHandler<TRequest, out TResponse>(IReadableChannel<TRequest> requestStream, IWritableChannel<TResponse> responseStream, MethodCallContext context);
}
