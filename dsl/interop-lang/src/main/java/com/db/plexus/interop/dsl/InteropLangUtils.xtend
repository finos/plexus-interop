/**
 * Copyright 2017-2018 Plexus Interop Deutsche Bank AG
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
package com.db.plexus.interop.dsl

import com.db.plexus.interop.dsl.protobuf.Message
import com.db.plexus.interop.dsl.protobuf.ProtoLangImportResolver
import com.db.plexus.interop.dsl.protobuf.ProtobufPackage
import com.google.inject.Inject
import org.eclipse.emf.ecore.EObject
import org.eclipse.emf.ecore.resource.ResourceSet
import org.eclipse.xtext.naming.QualifiedName
import org.eclipse.xtext.resource.IResourceDescription
import org.eclipse.xtext.resource.IResourceDescriptionsProvider
import com.google.inject.Singleton

@Singleton
class InteropLangUtils {
	
	public static final String DESCRIPTOR_RESOURCE_PATH = "interop/descriptor.proto"	
	public static final QualifiedName DESCRIPTOR_PACKAGE_NAME = QualifiedName.create("", "interop")
	
	@Inject
	protected IResourceDescriptionsProvider resourceDescriptionsProvider

	@Inject
	protected ProtoLangImportResolver importResolver
		
	
	def public Message getDescriptorsContainer(InteropOption option) {
		val name = option.descriptorContainerName
		val description = option.eResource.resourceSet.descriptorResourceDescription		
		return description.getExportedObjects(ProtobufPackage.Literals.MESSAGE, name, false).findFirst[x|true].EObjectOrProxy as Message
	}
	
	def public IResourceDescription getDescriptorResourceDescription(ResourceSet resourceSet) {
		return importResolver.resolveResourceDescription(resourceSet, DESCRIPTOR_RESOURCE_PATH)
	}
	
	def private static QualifiedName getDescriptorContainerName(InteropOption option) {
		return DESCRIPTOR_PACKAGE_NAME.append(option.eContainer.optionDescriptorMessageName)
	}
	
	def private static String getOptionDescriptorMessageName(EObject container) {
		return switch (container) {
			Application: "ApplicationOptions"
			ProvidedService: "ProvidedServiceOptions"
			ProvidedMethod: "ProvidedMethodOptions"
			ConsumedService: "ConsumedServiceOptions"
			ConsumedMethod: "ConsumedMethodOptions"
			default: throw new Exception("Unexpected option container: " + container.eClass.name)
		}
	}
}