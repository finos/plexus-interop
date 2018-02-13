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
import com.db.plexus.interop.dsl.gen.util.FileUtils
import com.google.inject.Inject
import java.io.File
import java.io.IOException
import com.db.plexus.interop.dsl.gen.BaseGenTask
import org.eclipse.xtext.resource.XtextResourceSet
import org.eclipse.xtext.resource.XtextResource
import org.eclipse.emf.ecore.resource.Resource
import org.eclipse.xtext.naming.IQualifiedNameProvider
import com.db.plexus.interop.dsl.protobuf.Option
import static extension com.db.plexus.interop.dsl.gen.InteropLangUtils.*
import com.db.plexus.interop.dsl.protobuf.Proto
import com.db.plexus.interop.dsl.protobuf.Message
import com.db.plexus.interop.dsl.protobuf.Service
import com.db.plexus.interop.dsl.protobuf.Method

class CsharpGenTask extends BaseGenTask {
	
	@Inject
	IQualifiedNameProvider qualifiedNameProvider

	override protected doGenWithResources(PlexusGenConfig config, XtextResourceSet resourceSet) throws IOException {
		
		println("Generating C# code for " + config.input + " from " + baseDirUri.toFileString + " to " + outDirUri.toFileString)
		
		val resources = resourceSet.resources
		
		for (resource: resources) {			
			var newUri = resource.URI.resolve(workingDirUri);
			if (newUri.toString().startsWith(baseDirUri.toString())) {
				newUri = newUri.deresolve(baseDirUri).resolve(outDirUri)
			} else {
				newUri = newUri.deresolve(resourceBaseUri).resolve(outDirUri)
			}
			var path = newUri.toFileString
			val file = new File(path + ".g.cs");			
			println("Generating " + file.path);	
			FileUtils.writeStringToFile(file, gen(resource as XtextResource))				
		}			
	}
	
	def String gen(XtextResource resource) {		
		'''		
		namespace «resource.csharpNamespace» {
			
			using global::Plexus;
			using global::Plexus.Interop;
			using global::System.Threading.Tasks;
			
			«FOR service : resource.services SEPARATOR '\n'»
				«gen(service)»
			«ENDFOR»
		}
		'''
	}
	
	def String gen(Service service) {
		'''
		public class «service.name» : IProxy {

			«FOR method : service.methods»				
				«genMethodDescriptor(method)»
			«ENDFOR»

			public interface IProxy«IF service.methods.length > 0»:«ENDIF»
				«FOR method : service.methods SEPARATOR ','»
					I«method.name»Proxy
				«ENDFOR»
			{ }
			
			public interface IImpl«IF service.methods.length > 0»:«ENDIF»
				«FOR method : service.methods SEPARATOR ','»
					I«method.name»Impl
				«ENDFOR»
			{ }

			«FOR method : service.methods SEPARATOR '\n'»
			public interface I«method.name»Proxy {
				Task<«method.response.message.csharpFullName»> «method.name»(«method.request.message.csharpFullName» request);
			}
			«ENDFOR»
			
			«FOR method : service.methods SEPARATOR '\n'»
			public interface I«method.name»Impl {
				Task<«method.response.message.csharpFullName»> «method.name»(«method.request.message.csharpFullName» request, MethodCallContext context);
			}
			«ENDFOR»

			private readonly IClientCallInvoker _callInvoker;
			private readonly Maybe<string> _alias;
			
			public «service.name»(IClientCallInvoker callInvoker) : this(callInvoker, Maybe<string>.Nothing) {
				_callInvoker = callInvoker;
				_alias = alias; 
			}

			public «service.name»(IClientCallInvoker callInvoker, Maybe<string> alias) {
				_callInvoker = callInvoker;
				_alias = alias;
				«FOR method : service.methods SEPARATOR '\n'»
					_«method.name» = Method<
				public interface I«method.name»Impl {
					Task<«method.response.message.csharpFullName»> «method.name»(«method.request.message.csharpFullName» request, MethodCallContext context);
				} 
				«ENDFOR»
			}
		}
		'''
	}
	
	def String genMethodDescriptor(Method method, String name) {
		val serviceName = method.service.getFullName(qualifiedNameProvider);
		val requestName = method.request.message.csharpFullName
		val responseName = method.response.message.csharpFullName
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
		'''
		public static readonly «methodType»Method<«requestName», «responseName»> «name» = Method.«methodType»<«requestName», «responseName»>("«serviceName»", "«method.name»");
		'''
	}
	
	def getCsharpNamespace(Resource resource) {
		val package = resource.allContents.filter(typeof(Proto)).findFirst[x | true]									
		var ns = package.getFullName(qualifiedNameProvider)		
		val option = package.eContents.filter(typeof(Option)).findFirst[o | o.name.equals("csharp_namespace")]
		if (option !== null) {
			ns = option.value.substring(1, option.value.length - 1)
		}
		return ns
	}	
	
	def getCsharpFullName(Message obj) {
		return "global::" + getCsharpNamespace(obj.eResource) + "." + obj.name
	}
}