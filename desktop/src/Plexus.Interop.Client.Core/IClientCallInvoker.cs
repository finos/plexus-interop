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
﻿namespace Plexus.Interop
{
    public interface IClientCallInvoker
    {        
        /// <summary>
        /// Invokes a simple remote call asynchronously.
        /// </summary>
        IUnaryMethodCall Call<TRequest>(IUnaryMethod<TRequest, Nothing> method, TRequest request, ContextLinkageOptions contextLinkageOptions = default);

        /// <summary>
        /// Invokes a simple remote call asynchronously.
        /// </summary>
        IUnaryMethodCall CallUnary<TRequest>(MethodCallDescriptor descriptor, TRequest request, ContextLinkageOptions contextLinkageOptions = default);

        /// <summary>
        /// Invokes a simple remote call asynchronously.
        /// </summary>
        IUnaryMethodCall<TResponse> Call<TRequest, TResponse>(IUnaryMethod<TRequest, TResponse> method, TRequest request, ContextLinkageOptions contextLinkageOptions = default);

        /// <summary>
        /// Invokes a simple remote call asynchronously.
        /// </summary>
        IUnaryMethodCall<TResponse> CallUnary<TRequest, TResponse>(MethodCallDescriptor descriptor, TRequest request, ContextLinkageOptions contextLinkageOptions = default);

        /// <summary>
        /// Invokes server streaming call asynchronously.
        /// In server streaming scenario, client sends a single request and server responds with a stream of responses.
        /// </summary>
        IServerStreamingMethodCall<TResponse> Call<TRequest, TResponse>(IServerStreamingMethod<TRequest, TResponse> method, TRequest request, ContextLinkageOptions contextLinkageOptions = default);

        /// <summary>
        /// Invokes server streaming call asynchronously.
        /// In server streaming scenario, client sends a single request and server responds with a stream of responses.
        /// </summary>
        IServerStreamingMethodCall<TResponse> CallServerStreaming<TRequest, TResponse>(MethodCallDescriptor descriptor, TRequest request, ContextLinkageOptions contextLinkageOptions = default);

        /// <summary>
        /// Invokes a client streaming call asynchronously.
        /// In client streaming scenario, client sends a stream of requests and server responds with a single response.
        /// </summary>
        IClientStreamingMethodCall<TRequest, TResponse> Call<TRequest, TResponse>(IClientStreamingMethod<TRequest, TResponse> method, ContextLinkageOptions contextLinkageOptions = default);

        /// <summary>
        /// Invokes a client streaming call asynchronously.
        /// In client streaming scenario, client sends a stream of requests and server responds with a single response.
        /// </summary>
        IClientStreamingMethodCall<TRequest, TResponse> CallClientStreaming<TRequest, TResponse>(MethodCallDescriptor descriptor, ContextLinkageOptions contextLinkageOptions = default);

        /// <summary>
        /// Invokes a client streaming call asynchronously.
        /// In client streaming scenario, client sends a stream of requests and server responds with a single response.
        /// </summary>
        IDuplexStreamingMethodCall<TRequest, TResponse> Call<TRequest, TResponse>(IDuplexStreamingMethod<TRequest, TResponse> method, ContextLinkageOptions contextLinkageOptions = default);

        /// <summary>
        /// Invokes a client streaming call asynchronously.
        /// In client streaming scenario, client sends a stream of requests and server responds with a single response.
        /// </summary>
        IDuplexStreamingMethodCall<TRequest, TResponse> CallDuplexStreaming<TRequest, TResponse>(MethodCallDescriptor descriptor, ContextLinkageOptions contextLinkageOptions = default);
    }
}
