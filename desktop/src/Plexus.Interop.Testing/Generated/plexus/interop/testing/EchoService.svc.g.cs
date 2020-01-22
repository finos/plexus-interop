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
// <auto-generated>
// 	Generated by the Plexus Interop compiler.  DO NOT EDIT!
// 	source: plexus\interop\testing\echo_service.proto
// </auto-generated>
#pragma warning disable 1591, 0612, 3021
#region Designer generated code
namespace Plexus.Interop.Testing.Generated {
	
	using System;
	using global::Plexus;
	using global::Plexus.Channels;
	using global::Plexus.Interop;
	using global::System.Threading.Tasks;
					
	public static partial class EchoService {
		
		public const string Id = "plexus.interop.testing.EchoService";			
		public const string UnaryMethodId = "Unary";
		public const string ServerStreamingMethodId = "ServerStreaming";
		public const string ClientStreamingMethodId = "ClientStreaming";
		public const string DuplexStreamingMethodId = "DuplexStreaming";
		
		public static readonly EchoService.Descriptor DefaultDescriptor = CreateDescriptor();
		
		public static EchoService.Descriptor CreateDescriptor() {
			return new EchoService.Descriptor();
		} 
		
		public static EchoService.Descriptor CreateDescriptor(string alias) {
			return new EchoService.Descriptor(alias);
		}				
	
		public partial interface IUnaryProxy {
			IUnaryMethodCall<global::Plexus.Interop.Testing.Generated.EchoRequest> Unary(global::Plexus.Interop.Testing.Generated.EchoRequest request);
		}
		
		public partial interface IServerStreamingProxy {
			IServerStreamingMethodCall<global::Plexus.Interop.Testing.Generated.EchoRequest> ServerStreaming(global::Plexus.Interop.Testing.Generated.EchoRequest request);
		}
		
		public partial interface IClientStreamingProxy {
			IClientStreamingMethodCall<global::Plexus.Interop.Testing.Generated.EchoRequest, global::Plexus.Interop.Testing.Generated.EchoRequest> ClientStreaming();
		}
		
		public partial interface IDuplexStreamingProxy {
			IDuplexStreamingMethodCall<global::Plexus.Interop.Testing.Generated.EchoRequest, global::Plexus.Interop.Testing.Generated.EchoRequest> DuplexStreaming();
		}
		
		public partial interface IUnaryImpl {
			Task<global::Plexus.Interop.Testing.Generated.EchoRequest> Unary(global::Plexus.Interop.Testing.Generated.EchoRequest request, MethodCallContext context);
		}
		
		public partial interface IServerStreamingImpl {
			Task ServerStreaming(global::Plexus.Interop.Testing.Generated.EchoRequest request, IWritableChannel<global::Plexus.Interop.Testing.Generated.EchoRequest> responseStream, MethodCallContext context);
		}
		
		public partial interface IClientStreamingImpl {
			Task<global::Plexus.Interop.Testing.Generated.EchoRequest> ClientStreaming(IReadableChannel<global::Plexus.Interop.Testing.Generated.EchoRequest> requestStream, MethodCallContext context);
		}
		
		public partial interface IDuplexStreamingImpl {
			Task DuplexStreaming(IReadableChannel<global::Plexus.Interop.Testing.Generated.EchoRequest> requestStream, IWritableChannel<global::Plexus.Interop.Testing.Generated.EchoRequest> responseStream, MethodCallContext context);
		}
		
		public sealed partial class Descriptor {
		
			public UnaryMethod<global::Plexus.Interop.Testing.Generated.EchoRequest, global::Plexus.Interop.Testing.Generated.EchoRequest> UnaryMethod {get; private set; }
			public ServerStreamingMethod<global::Plexus.Interop.Testing.Generated.EchoRequest, global::Plexus.Interop.Testing.Generated.EchoRequest> ServerStreamingMethod {get; private set; }
			public ClientStreamingMethod<global::Plexus.Interop.Testing.Generated.EchoRequest, global::Plexus.Interop.Testing.Generated.EchoRequest> ClientStreamingMethod {get; private set; }
			public DuplexStreamingMethod<global::Plexus.Interop.Testing.Generated.EchoRequest, global::Plexus.Interop.Testing.Generated.EchoRequest> DuplexStreamingMethod {get; private set; }
			
			public Descriptor() {				
				UnaryMethod = Method.Unary<global::Plexus.Interop.Testing.Generated.EchoRequest, global::Plexus.Interop.Testing.Generated.EchoRequest>(Id, UnaryMethodId);
				ServerStreamingMethod = Method.ServerStreaming<global::Plexus.Interop.Testing.Generated.EchoRequest, global::Plexus.Interop.Testing.Generated.EchoRequest>(Id, ServerStreamingMethodId);
				ClientStreamingMethod = Method.ClientStreaming<global::Plexus.Interop.Testing.Generated.EchoRequest, global::Plexus.Interop.Testing.Generated.EchoRequest>(Id, ClientStreamingMethodId);
				DuplexStreamingMethod = Method.DuplexStreaming<global::Plexus.Interop.Testing.Generated.EchoRequest, global::Plexus.Interop.Testing.Generated.EchoRequest>(Id, DuplexStreamingMethodId);
			}
		
			public Descriptor(string alias) {
				UnaryMethod = Method.Unary<global::Plexus.Interop.Testing.Generated.EchoRequest, global::Plexus.Interop.Testing.Generated.EchoRequest>(Id, alias, UnaryMethodId);
				ServerStreamingMethod = Method.ServerStreaming<global::Plexus.Interop.Testing.Generated.EchoRequest, global::Plexus.Interop.Testing.Generated.EchoRequest>(Id, alias, ServerStreamingMethodId);
				ClientStreamingMethod = Method.ClientStreaming<global::Plexus.Interop.Testing.Generated.EchoRequest, global::Plexus.Interop.Testing.Generated.EchoRequest>(Id, alias, ClientStreamingMethodId);
				DuplexStreamingMethod = Method.DuplexStreaming<global::Plexus.Interop.Testing.Generated.EchoRequest, global::Plexus.Interop.Testing.Generated.EchoRequest>(Id, alias, DuplexStreamingMethodId);
			}
		}
	}
					
}
#endregion Designer generated code
