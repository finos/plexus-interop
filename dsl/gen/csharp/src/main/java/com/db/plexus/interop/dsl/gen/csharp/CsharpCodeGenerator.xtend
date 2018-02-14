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
package com.db.plexus.interop.dsl.gen.csharp

import com.db.plexus.interop.dsl.gen.PlexusGenConfig
import com.db.plexus.interop.dsl.protobuf.Message
import com.db.plexus.interop.dsl.protobuf.Method
import com.db.plexus.interop.dsl.protobuf.Option
import com.db.plexus.interop.dsl.protobuf.Proto
import com.db.plexus.interop.dsl.protobuf.Service
import org.eclipse.emf.ecore.resource.Resource
import org.eclipse.xtext.naming.IQualifiedNameProvider
import org.eclipse.xtext.resource.XtextResource

import static extension com.db.plexus.interop.dsl.gen.InteropLangUtils.*
import com.db.plexus.interop.dsl.Application
import com.db.plexus.interop.dsl.ProvidedService

class CsharpCodeGenerator  {
    
    IQualifiedNameProvider qualifiedNameProvider
    
    PlexusGenConfig config
      
    new(PlexusGenConfig config, IQualifiedNameProvider qualifiedNameProvider) {    	
    	this.config = config
    	this.qualifiedNameProvider = qualifiedNameProvider
    }
    
    def String gen(XtextResource resource) {
		'''		
			namespace «resource.csharpNamespace» {
				
				using global::Plexus;
				using global::Plexus.Channels;
				using global::Plexus.Interop;
				using global::System.Threading.Tasks;
								
				«FOR service : resource.services SEPARATOR '\n'»
					«gen(service)»
				«ENDFOR»
								
				«FOR application : resource.applications SEPARATOR '\n'»
					«gen(application)»
				«ENDFOR»
			}
		'''
	}
	
	def String gen(Application application) {
		'''
			public sealed class «application.name.toFirstUpper» {
				
				public const string Id = "«getFullName(application, qualifiedNameProvider)»";
				
				«IF application.providedServices.length > 0»
				public sealed class Impl {
														
					public Impl(					
						«FOR providedService: application.providedServices SEPARATOR ','»
							«providedService.aliasOrName»Impl «providedService.aliasOrName.toFirstLower»Impl
						«ENDFOR»
					) {
						«FOR providedService: application.providedServices SEPARATOR ','»
							«providedService.aliasOrName» = «providedService.aliasOrName.toFirstLower»Impl;
						«ENDFOR»
					}
					
					«FOR providedService: application.providedServices»
						public «providedService.aliasOrName»Impl «providedService.aliasOrName» { get; private set; }
					«ENDFOR»
					
					public ClientOptionsBuilder Configure(ClientOptionsBuilder builder) {
						«FOR providedService: application.providedServices»
							builder = «providedService.aliasOrName».Configure(builder);
						«ENDFOR»
						return builder;
					}
				}
				
				«FOR providedService: application.providedServices SEPARATOR '\n'»
					public interface I«providedService.aliasOrName»Impl«IF providedService.methods.length > 0»:«ENDIF»
						«FOR providedMethod : providedService.methods SEPARATOR ','»
							«providedService.service.csharpFullName».I«providedMethod.method.name.toFirstUpper»Impl
						«ENDFOR»
					{ }
					
					public sealed class «providedService.aliasOrName»Impl {
						
						public static «providedService.aliasOrName»Impl Create(I«providedService.aliasOrName»Impl impl) {
							return new «providedService.aliasOrName»Impl(impl);
						}
						
						public static «providedService.aliasOrName»Impl Create<T>(T impl)
							«IF providedService.methods.length > 0»
								where T:
								«FOR providedMethod : providedService.methods SEPARATOR ','»
									«providedService.service.csharpFullName».I«providedMethod.method.name.toFirstUpper»Impl
								«ENDFOR»
							«ENDIF»
						{
							return Create((I«providedService.aliasOrName»Impl)new «providedService.aliasOrName»Impl<T>(impl));
						}
						
						private readonly I«providedService.aliasOrName»Impl _impl;
						
						private «providedService.aliasOrName»Impl(I«providedService.aliasOrName»Impl impl) {
							_impl = impl;
						}
						
						public ClientOptionsBuilder Configure(ClientOptionsBuilder builder) {
							«IF providedService.alias === null»
							return builder.WithProvidedService("«getFullName(providedService.service, qualifiedNameProvider)»", Configure);
							«ELSE»
							return builder.WithProvidedService("«getFullName(providedService.service, qualifiedNameProvider)»", "«providedService.alias»", Configure);
							«ENDIF»							
						}
						
						private ProvidedServiceDefinition.Builder Configure(ProvidedServiceDefinition.Builder builder) {
							«FOR providedMethod : providedService.methods»
								«IF providedMethod.method.isPointToPoint»
								builder = builder.WithUnaryMethod«providedMethod.method.genericArgs»("«providedMethod.method.name»", _impl.«providedMethod.method.name.toFirstUpper»);
								«ELSEIF providedMethod.method.serverStreaming»
								builder = builder.WithServerStreamingMethod«providedMethod.method.genericArgs»("«providedMethod.method.name»", _impl.«providedMethod.method.name.toFirstUpper»);
								«ELSEIF providedMethod.method.clientStreaming»
								builder = builder.WithClientStreamingMethod«providedMethod.method.genericArgs»("«providedMethod.method.name»", _impl.«providedMethod.method.name.toFirstUpper»);
								«ELSEIF providedMethod.method.bidiStreaming»
								builder = builder.WithDuplexStreamingMethod«providedMethod.method.genericArgs»("«providedMethod.method.name»", _impl.«providedMethod.method.name.toFirstUpper»);
								«ENDIF»														
							«ENDFOR»
							return builder; 							
						}
					}
					
					private sealed class «providedService.aliasOrName»Impl<T>: I«providedService.aliasOrName»Impl
						«IF providedService.methods.length > 0»
							where T:
							«FOR providedMethod : providedService.methods SEPARATOR ','»
								«providedService.service.csharpFullName».I«providedMethod.method.name.toFirstUpper»Impl
							«ENDFOR»
						«ENDIF» 
					{
						private readonly T _impl;
						
						public «providedService.aliasOrName»Impl(T impl) {
							_impl = impl;
						}
						
						«FOR providedMethod : providedService.methods SEPARATOR '\n'»
							public «genImplSignature(providedMethod.method)» {
								return «genImplCallCode(providedMethod.method, "_impl")»;
							}
						«ENDFOR»						
					}
				«ENDFOR»
				«ENDIF»
			}
		'''		
	}
	
	def String genImplCallCode(Method method, String varName) {
		if (method.pointToPoint) {
			'''«varName».«method.name.toFirstUpper»(request, context)'''
		} else if (method.serverStreaming) {
			'''«varName».«method.name.toFirstUpper»(request, responseStream, context)'''
		} else if (method.clientStreaming) {
			'''«varName».«method.name.toFirstUpper»(requestStream, context)'''
		} else if (method.bidiStreaming) {			
			'''«varName».«method.name.toFirstUpper»(requestStream, responseStream, context)'''
		}
	}	
	
	def String getAliasOrName(ProvidedService providedService) {
		if (providedService.alias !== null) providedService.alias.toFirstUpper else providedService.service.name.toFirstUpper 
	}

	def String gen(Service service) {
		'''
			public sealed class «service.name.toFirstUpper» : «service.name.toFirstUpper».IProxy {
			
				«FOR method : service.methods»				
					«genMethodDescriptorStaticDeclaration(method)»
				«ENDFOR»
			
				public interface IProxy«IF service.methods.length > 0»:«ENDIF»
					«FOR method : service.methods SEPARATOR ','»
						I«method.name.toFirstUpper»Proxy
					«ENDFOR»
				{ }
				
				public interface IImpl«IF service.methods.length > 0»:«ENDIF»
					«FOR method : service.methods SEPARATOR ','»
						I«method.name.toFirstUpper»Impl
					«ENDFOR»
				{ }
			
				«FOR method : service.methods SEPARATOR '\n'»
				public interface I«method.name.toFirstUpper»Proxy {
					«genProxySignature(method, "request")»;
				}
				«ENDFOR»
				
				«FOR method : service.methods SEPARATOR '\n'»
				public interface I«method.name.toFirstUpper»Impl {
					«genImplSignature(method)»;
				}
				«ENDFOR»
			
				private readonly IClientCallInvoker _callInvoker;
				
				«FOR method : service.methods»
				private readonly «method.csharpTypeDeclaration» «method.privateVarName»;
				«ENDFOR»
				
				public «service.name.toFirstUpper»(IClientCallInvoker callInvoker) {
					_callInvoker = callInvoker;				
					«FOR method : service.methods»
						«method.privateVarName» = «genMethodDescriptorDeclaration(method)»;
					«ENDFOR»
				}
			
				public «service.name.toFirstUpper»(IClientCallInvoker callInvoker, string alias) {
					_callInvoker = callInvoker;				
					«FOR method : service.methods»
						«method.privateVarName» = «genMethodDescriptorDeclaration(method, "alias")»;
					«ENDFOR»
				}
				
				«FOR method : service.methods SEPARATOR '\n'»
					public «genProxySignature(method, "request")» {
						return «genCallCode(method, "request")»;
					}
				«ENDFOR»
			}
		'''
	}

	def String genCallCode(Method method, String requestVarName) {
		if (!method.request.isStream) {
			return '''_callInvoker.Call(«method.privateVarName», «requestVarName»)'''
		} else {
			return '''_callInvoker.Call(«method.privateVarName»)'''
		}
	}

	def String genProxySignature(Method method, String requestVarName) {
		if (method.pointToPoint) {
			'''IUnaryMethodCall<«method.response.message.csharpFullName»> «method.name.toFirstUpper»(«method.request.message.csharpFullName» «requestVarName»)'''
		} else if (method.serverStreaming) {
			'''IServerStreamingMethodCall<«method.response.message.csharpFullName»> «method.name.toFirstUpper»(«method.request.message.csharpFullName» «requestVarName»)'''
		} else if (method.clientStreaming) {
			'''IClientStreamingMethodCall<«method.request.message.csharpFullName», «method.response.message.csharpFullName»> «method.name.toFirstUpper»()'''
		} else if (method.bidiStreaming) {
			'''IDuplexStreamingMethodCall<«method.request.message.csharpFullName», «method.response.message.csharpFullName»> «method.name.toFirstUpper»()'''
		}
	}

	def String genImplSignature(Method method) {
		if (method.pointToPoint) {
			'''Task<«method.response.message.csharpFullName»> «method.name.toFirstUpper»(«method.request.message.csharpFullName» request, MethodCallContext context)'''
		} else if (method.serverStreaming) {
			'''Task «method.name.toFirstUpper»(«method.request.message.csharpFullName» request, IWritableChannel<«method.response.message.csharpFullName»> responseStream, MethodCallContext context)'''
		} else if (method.clientStreaming) {
			'''Task<«method.response.message.csharpFullName»> «method.name.toFirstUpper»(IReadableChannel<«method.request.message.csharpFullName»> requestStream, MethodCallContext context)'''
		} else if (method.bidiStreaming) {
			'''Task «method.name.toFirstUpper»(IReadableChannel<«method.request.message.csharpFullName»> requestStream, IWritableChannel<«method.response.message.csharpFullName»> responseStream, MethodCallContext context)'''
		}
	}

	def String genMethodDescriptorStaticDeclaration(Method method) {
		'''public static readonly «method.getCsharpTypeDeclaration» «method.name.toFirstUpper»Method = «genMethodDescriptorDeclaration(method)»;'''
	}

	def String genMethodDescriptorDeclaration(Method method) {
		val serviceName = method.service.getFullName(qualifiedNameProvider);
		val type = method.type
		'''Method.«type»«method.genericArgs»("«serviceName»", "«method.name»")'''
	}

	def String genMethodDescriptorDeclaration(Method method, String aliasVar) {
		val serviceName = method.service.getFullName(qualifiedNameProvider);
		val type = method.type
		'''Method.«type»«method.genericArgs»("«serviceName»", «aliasVar», "«method.name»")'''
	}

	def String getGenericArgs(Method method) {
		val requestName = method.request.message.csharpFullName
		val responseName = method.response.message.csharpFullName
		'''<«requestName», «responseName»>'''
	}

	def String getCsharpTypeDeclaration(Method method) {
		'''«method.type»Method«method.genericArgs»'''
	}

	def String getType(Method method) {
		var methodType = "Unary"
		if (method.pointToPoint) {
			methodType = "Unary"
		} else if (method.serverStreaming) {
			methodType = "ServerStreaming"
		} else if (method.bidiStreaming) {
			methodType = "DuplexStreaming"
		} else if (method.clientStreaming) {
			methodType = "ClientStreaming"
		}
	}

	def getPrivateVarName(Method method) {
		"_" + method.name.toFirstLower;
	}

	def getCsharpNamespace(Resource resource) {
		var ns = "Plexus.Interop.Generated";
		val package = resource.allContents.filter(typeof(Proto)).findFirst[x|true]
		if (package !== null) {					
			ns = qualifiedNameProvider.getFullyQualifiedName(package).skipFirst(1).segments.map[x|x.toFirstUpper].join(".");		
		}
		val option = package.eContents.filter(typeof(Option)).findFirst[o|o.name.equals("csharp_namespace")]
		if (option !== null) {			
			ns = option.value.substring(1, option.value.length - 1)
		}
		return ns
	}

	def getCsharpFullName(Message obj) {
		return "global::" + getCsharpNamespace(obj.eResource) + "." + obj.name.toFirstUpper
	}    
	
	def getCsharpFullName(Service obj) {
		return "global::" + getCsharpNamespace(obj.eResource) + "." + obj.name.toFirstUpper
	}
}