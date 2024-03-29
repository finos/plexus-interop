/**
 * Copyright 2017-2021 Plexus Interop Deutsche Bank AG
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
// 	source: interop\app_lifecycle_service.proto
// </auto-generated>
#pragma warning disable 1591, 0612, 3021
#region Designer generated code
namespace Plexus.Host.Internal.Generated {
	
	using System;
	using global::Plexus;
	using global::Plexus.Channels;
	using global::Plexus.Interop;
	using global::System.Threading.Tasks;
					
	internal static partial class AppLifecycleService {
		
		public const string Id = "interop.AppLifecycleService";			
		public const string ResolveAppMethodId = "ResolveApp";
		public const string GetLifecycleEventStreamMethodId = "GetLifecycleEventStream";
		public const string GetInvocationEventStreamMethodId = "GetInvocationEventStream";
		public const string GetConnectionsMethodId = "GetConnections";
		public const string GetConnectionsStreamMethodId = "GetConnectionsStream";
		
		public static readonly AppLifecycleService.Descriptor DefaultDescriptor = CreateDescriptor();
		
		public static AppLifecycleService.Descriptor CreateDescriptor() {
			return new AppLifecycleService.Descriptor();
		} 
		
		public static AppLifecycleService.Descriptor CreateDescriptor(string alias) {
			return new AppLifecycleService.Descriptor(alias);
		}				
	
		public partial interface IResolveAppProxy {
			IUnaryMethodCall<global::Plexus.Host.Internal.Generated.ResolveAppResponse> ResolveApp(global::Plexus.Host.Internal.Generated.ResolveAppRequest request);
		}
		
		public partial interface IGetLifecycleEventStreamProxy {
			IServerStreamingMethodCall<global::Plexus.Host.Internal.Generated.AppLifecycleEvent> GetLifecycleEventStream(global::Google.Protobuf.WellKnownTypes.Empty request);
		}
		
		public partial interface IGetInvocationEventStreamProxy {
			IServerStreamingMethodCall<global::Plexus.Host.Internal.Generated.InvocationEvent> GetInvocationEventStream(global::Google.Protobuf.WellKnownTypes.Empty request);
		}
		
		public partial interface IGetConnectionsProxy {
			IUnaryMethodCall<global::Plexus.Host.Internal.Generated.GetConnectionsResponse> GetConnections(global::Plexus.Host.Internal.Generated.GetConnectionsRequest request);
		}
		
		public partial interface IGetConnectionsStreamProxy {
			IServerStreamingMethodCall<global::Plexus.Host.Internal.Generated.GetConnectionsEvent> GetConnectionsStream(global::Plexus.Host.Internal.Generated.GetConnectionsRequest request);
		}
		
		public partial interface IResolveAppImpl {
			Task<global::Plexus.Host.Internal.Generated.ResolveAppResponse> ResolveApp(global::Plexus.Host.Internal.Generated.ResolveAppRequest request, MethodCallContext context);
		}
		
		public partial interface IGetLifecycleEventStreamImpl {
			Task GetLifecycleEventStream(global::Google.Protobuf.WellKnownTypes.Empty request, IWritableChannel<global::Plexus.Host.Internal.Generated.AppLifecycleEvent> responseStream, MethodCallContext context);
		}
		
		public partial interface IGetInvocationEventStreamImpl {
			Task GetInvocationEventStream(global::Google.Protobuf.WellKnownTypes.Empty request, IWritableChannel<global::Plexus.Host.Internal.Generated.InvocationEvent> responseStream, MethodCallContext context);
		}
		
		public partial interface IGetConnectionsImpl {
			Task<global::Plexus.Host.Internal.Generated.GetConnectionsResponse> GetConnections(global::Plexus.Host.Internal.Generated.GetConnectionsRequest request, MethodCallContext context);
		}
		
		public partial interface IGetConnectionsStreamImpl {
			Task GetConnectionsStream(global::Plexus.Host.Internal.Generated.GetConnectionsRequest request, IWritableChannel<global::Plexus.Host.Internal.Generated.GetConnectionsEvent> responseStream, MethodCallContext context);
		}
		
		public sealed partial class Descriptor {
		
			public UnaryMethod<global::Plexus.Host.Internal.Generated.ResolveAppRequest, global::Plexus.Host.Internal.Generated.ResolveAppResponse> ResolveAppMethod {get; private set; }
			public ServerStreamingMethod<global::Google.Protobuf.WellKnownTypes.Empty, global::Plexus.Host.Internal.Generated.AppLifecycleEvent> GetLifecycleEventStreamMethod {get; private set; }
			public ServerStreamingMethod<global::Google.Protobuf.WellKnownTypes.Empty, global::Plexus.Host.Internal.Generated.InvocationEvent> GetInvocationEventStreamMethod {get; private set; }
			public UnaryMethod<global::Plexus.Host.Internal.Generated.GetConnectionsRequest, global::Plexus.Host.Internal.Generated.GetConnectionsResponse> GetConnectionsMethod {get; private set; }
			public ServerStreamingMethod<global::Plexus.Host.Internal.Generated.GetConnectionsRequest, global::Plexus.Host.Internal.Generated.GetConnectionsEvent> GetConnectionsStreamMethod {get; private set; }
			
			public Descriptor() {				
				ResolveAppMethod = Method.Unary<global::Plexus.Host.Internal.Generated.ResolveAppRequest, global::Plexus.Host.Internal.Generated.ResolveAppResponse>(Id, ResolveAppMethodId);
				GetLifecycleEventStreamMethod = Method.ServerStreaming<global::Google.Protobuf.WellKnownTypes.Empty, global::Plexus.Host.Internal.Generated.AppLifecycleEvent>(Id, GetLifecycleEventStreamMethodId);
				GetInvocationEventStreamMethod = Method.ServerStreaming<global::Google.Protobuf.WellKnownTypes.Empty, global::Plexus.Host.Internal.Generated.InvocationEvent>(Id, GetInvocationEventStreamMethodId);
				GetConnectionsMethod = Method.Unary<global::Plexus.Host.Internal.Generated.GetConnectionsRequest, global::Plexus.Host.Internal.Generated.GetConnectionsResponse>(Id, GetConnectionsMethodId);
				GetConnectionsStreamMethod = Method.ServerStreaming<global::Plexus.Host.Internal.Generated.GetConnectionsRequest, global::Plexus.Host.Internal.Generated.GetConnectionsEvent>(Id, GetConnectionsStreamMethodId);
			}
		
			public Descriptor(string alias) {
				ResolveAppMethod = Method.Unary<global::Plexus.Host.Internal.Generated.ResolveAppRequest, global::Plexus.Host.Internal.Generated.ResolveAppResponse>(Id, alias, ResolveAppMethodId);
				GetLifecycleEventStreamMethod = Method.ServerStreaming<global::Google.Protobuf.WellKnownTypes.Empty, global::Plexus.Host.Internal.Generated.AppLifecycleEvent>(Id, alias, GetLifecycleEventStreamMethodId);
				GetInvocationEventStreamMethod = Method.ServerStreaming<global::Google.Protobuf.WellKnownTypes.Empty, global::Plexus.Host.Internal.Generated.InvocationEvent>(Id, alias, GetInvocationEventStreamMethodId);
				GetConnectionsMethod = Method.Unary<global::Plexus.Host.Internal.Generated.GetConnectionsRequest, global::Plexus.Host.Internal.Generated.GetConnectionsResponse>(Id, alias, GetConnectionsMethodId);
				GetConnectionsStreamMethod = Method.ServerStreaming<global::Plexus.Host.Internal.Generated.GetConnectionsRequest, global::Plexus.Host.Internal.Generated.GetConnectionsEvent>(Id, alias, GetConnectionsStreamMethodId);
			}
		}
	}
					
}
#endregion Designer generated code
