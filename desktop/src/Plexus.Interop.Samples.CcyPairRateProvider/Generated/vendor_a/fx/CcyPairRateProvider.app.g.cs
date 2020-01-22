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
// 	source: vendor_a\fx\ccy_pair_rate_provider.interop
// </auto-generated>
#pragma warning disable 1591, 0612, 3021
#region Designer generated code
namespace Plexus.Interop.Samples.CcyPairRateProvider.Generated {
	
	using System;
	using global::Plexus;
	using global::Plexus.Channels;
	using global::Plexus.Interop;
	using global::System.Threading.Tasks;
					
					
	public partial interface ICcyPairRateProviderClient: IClient {
	}
	
	public sealed partial class CcyPairRateProviderClient: ClientBase, ICcyPairRateProviderClient {
		
		public const string Id = "vendor_a.fx.CcyPairRateProvider";
		
		private static ClientOptions CreateClientOptions(CcyPairRateProviderClient.ServiceBinder serviceBinder, Func<ClientOptionsBuilder, ClientOptionsBuilder> setup = null) {
			ClientOptionsBuilder builder = new ClientOptionsBuilder().WithApplicationId(Id).WithDefaultConfiguration();
			serviceBinder.Bind(builder);
			if (setup != null) {
				builder = setup(builder);
			}
			return builder.Build();
		}
		
		public CcyPairRateProviderClient(
			CcyPairRateProviderClient.ICcyPairRateServiceImpl ccyPairRateService,
			Func<ClientOptionsBuilder, ClientOptionsBuilder> setup = null
		)
		:this(new CcyPairRateProviderClient.ServiceBinder(
			ccyPairRateService
		), setup) { }
		
		public CcyPairRateProviderClient(CcyPairRateProviderClient.ServiceBinder serviceBinder, Func<ClientOptionsBuilder, ClientOptionsBuilder> setup = null): base(CreateClientOptions(serviceBinder, setup)) 
		{
		}
	
		public sealed partial class ServiceBinder {
			
			public ServiceBinder(
				CcyPairRateProviderClient.ICcyPairRateServiceImpl ccyPairRateService
			) {
				_ccyPairRateServiceBinder = new CcyPairRateProviderClient.CcyPairRateServiceBinder(ccyPairRateService);
			}
			
			private CcyPairRateServiceBinder _ccyPairRateServiceBinder;
			
			public ClientOptionsBuilder Bind(ClientOptionsBuilder builder) {
				builder = _ccyPairRateServiceBinder.Bind(builder);
				return builder;
			}
		}
	
		public partial interface ICcyPairRateServiceImpl:
			global::Plexus.Interop.Samples.CcyPairRateProvider.Generated.CcyPairRateService.IGetRateImpl
		{ }
		
		private sealed partial class CcyPairRateServiceBinder {
			
			
			private readonly ICcyPairRateServiceImpl _impl;
			
			public CcyPairRateServiceBinder(ICcyPairRateServiceImpl impl) {
				_impl = impl;
			}
			
			public ClientOptionsBuilder Bind(ClientOptionsBuilder builder) {
				return builder.WithProvidedService(global::Plexus.Interop.Samples.CcyPairRateProvider.Generated.CcyPairRateService.Id, Bind);
			}
			
			private ProvidedServiceDefinition.Builder Bind(ProvidedServiceDefinition.Builder builder) {
				builder = builder.WithUnaryMethod<global::Plexus.Interop.Samples.CcyPairRateProvider.Generated.CcyPair, global::Plexus.Interop.Samples.CcyPairRateProvider.Generated.CcyPairRate>(global::Plexus.Interop.Samples.CcyPairRateProvider.Generated.CcyPairRateService.GetRateMethodId, _impl.GetRate);
				return builder; 							
			}
		}
		
		public sealed partial class CcyPairRateServiceImpl: ICcyPairRateServiceImpl
		{
			private readonly UnaryMethodHandler<global::Plexus.Interop.Samples.CcyPairRateProvider.Generated.CcyPair, global::Plexus.Interop.Samples.CcyPairRateProvider.Generated.CcyPairRate> _getRateHandler;
			
			public CcyPairRateServiceImpl(
				UnaryMethodHandler<global::Plexus.Interop.Samples.CcyPairRateProvider.Generated.CcyPair, global::Plexus.Interop.Samples.CcyPairRateProvider.Generated.CcyPairRate> getRateHandler
			) {
				_getRateHandler = getRateHandler;
			}
			
			public Task<global::Plexus.Interop.Samples.CcyPairRateProvider.Generated.CcyPairRate> GetRate(global::Plexus.Interop.Samples.CcyPairRateProvider.Generated.CcyPair request, MethodCallContext context) {
				return _getRateHandler(request, context);
			}
		}					
		
		public sealed partial class CcyPairRateServiceImpl<T>: ICcyPairRateServiceImpl
			where T:
			global::Plexus.Interop.Samples.CcyPairRateProvider.Generated.CcyPairRateService.IGetRateImpl
		{
			private readonly T _impl;
			
			public CcyPairRateServiceImpl(T impl) {
				_impl = impl;
			}
			
			public Task<global::Plexus.Interop.Samples.CcyPairRateProvider.Generated.CcyPairRate> GetRate(global::Plexus.Interop.Samples.CcyPairRateProvider.Generated.CcyPair request, MethodCallContext context) {
				return _impl.GetRate(request, context);
			}
		}
		
	}
}
#endregion Designer generated code
