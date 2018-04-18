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
package com.db.plexus.interop.dsl.gen.csharp

import com.db.plexus.interop.dsl.gen.PlexusGenConfig
import com.db.plexus.interop.dsl.gen.proto.ProtoGenTask
import java.io.IOException
import org.eclipse.xtext.resource.XtextResourceSet
import com.google.inject.Inject
import com.db.plexus.interop.dsl.protobuf.ProtobufPackage
import org.eclipse.xtext.naming.QualifiedName
import com.db.plexus.interop.dsl.protobuf.ProtobufFactory
import com.db.plexus.interop.dsl.protobuf.Field
import com.db.plexus.interop.dsl.protobuf.ProtoLangUtils

class CsharpProtoGenTask extends ProtoGenTask {
	
	private static final QualifiedName CSHARP_NAMESPACE_OPTION_DESCRIPTOR_NAME = 
		QualifiedName.create("", "google", "protobuf", "FileOptions", "csharp_namespace")
		
	@Inject
	ProtoLangUtils utils
	 			
	override protected doGenWithResources(PlexusGenConfig config, XtextResourceSet resourceSet) throws IOException {
		var namespace = config.namespace;
		if (config.namespace !== null) {
			if (namespace.startsWith("internal_access:")) {
				namespace = namespace.substring("internal_access:".length)
			}		
			val description = utils.getDescriptorResourceDescription(resourceSet)
			val optionDescriptor = description.getExportedObjects(
				ProtobufPackage.Literals.FIELD, 
				CSHARP_NAMESPACE_OPTION_DESCRIPTOR_NAME, 
				false
			).findFirst[x | true].EObjectOrProxy as Field
			val csharpNamespaceOption = ProtobufFactory.eINSTANCE.createOption()
			csharpNamespaceOption.isCustom = false
			csharpNamespaceOption.descriptor = optionDescriptor
			val stringConstant = ProtobufFactory.eINSTANCE.createStringConstant()
			stringConstant.value = namespace
			csharpNamespaceOption.value = stringConstant	
			super.customOptions.add(csharpNamespaceOption)		
		}

		super.doGenWithResources(config, resourceSet)
	}
}
