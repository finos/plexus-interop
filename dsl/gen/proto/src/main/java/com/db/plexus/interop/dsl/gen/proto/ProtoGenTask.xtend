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
package com.db.plexus.interop.dsl.gen.proto

import com.db.plexus.interop.dsl.gen.BaseGenTask
import com.db.plexus.interop.dsl.gen.PlexusGenConfig
import com.db.plexus.interop.dsl.protobuf.Import
import com.db.plexus.interop.dsl.protobuf.Message
import com.db.plexus.interop.dsl.protobuf.NamedElement
import com.db.plexus.interop.dsl.protobuf.Option
import com.db.plexus.interop.dsl.protobuf.Proto
import com.db.plexus.interop.dsl.protobuf.ProtobufFactory
import com.db.plexus.interop.dsl.protobuf.Service
import com.google.inject.Inject
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.util.Collections
import java.util.LinkedList
import org.eclipse.emf.common.util.URI
import org.eclipse.emf.ecore.resource.Resource
import org.eclipse.xtext.EcoreUtil2
import org.eclipse.xtext.diagnostics.Severity
import org.eclipse.xtext.naming.IQualifiedNameProvider
import org.eclipse.xtext.resource.XtextResourceSet
import org.eclipse.xtext.util.CancelIndicator
import org.eclipse.xtext.validation.CheckMode
import org.eclipse.xtext.validation.IResourceValidator
import org.eclipse.xtext.validation.Issue

public class ProtoGenTask extends BaseGenTask {

	@Inject
	IResourceValidator validator

	@Inject
	IQualifiedNameProvider qualifiedNameProvider

	protected val customOptions = new LinkedList<ProtoOption>

	public def getCustomOptions() {
		customOptions
	}

	override protected doGenWithResources(PlexusGenConfig config, XtextResourceSet rs) throws IOException {

		logger.info("Generating proto contract for " + config.input + " to folder " + config.outDir)

		val optionsUri = URI.createURI(
			ClassLoader.getSystemClassLoader().getResource("interop/Options.proto").toURI().toString())
			
		val descriptorUri = URI.createURI(
			ClassLoader.getSystemClassLoader().getResource("google/protobuf/descriptor.proto").toURI().toString())		
			
		var interopResourceBaseUri = optionsUri.trimSegments(2).appendSegment("");
		var protoResourceBaseUri = descriptorUri.trimSegments(3).appendSegment("");
		
		if (rs.resources.findFirst[r|r.URI.toString().endsWith("interop/Options.proto")] === null) {
			rs.getResource(optionsUri, true)
		}

		EcoreUtil2.resolveAll(rs)

		val allIssues = new LinkedList<Issue>()
		for (resource : rs.resources) {
			logger.info("Loaded resource: " + resource.URI)
			val issues = validator.validate(resource, CheckMode.ALL, CancelIndicator.NullImpl)
			allIssues.addAll(issues)
		}
		var errors = allIssues.filter[x|x.severity == Severity.ERROR].toList()
		var otherIssues = allIssues.filter[x|x.severity != Severity.ERROR]
		for (issue : otherIssues) {
			logger.warning(issue.toString)
		}
		if (errors.length > 0) {
			for (issue : errors) {
				logger.severe(issue.toString)				
			}
			throw new IOException("Errors found in the loaded resources")
		}

		val oldResources = new LinkedList<Resource>
		oldResources.addAll(rs.resources)

		for (r : oldResources) {

			if (r.contents.length > 0) {

				logger.info("Processing " + r.URI)

				val uriStr = r.URI.toString()
				val isProto = uriStr.endsWith(".proto")
				val isDescriptorProto = isProto && uriStr.endsWith("google/protobuf/descriptor.proto")
				val needAddCustomOptions = !isDescriptorProto
				val needAddPlexusOptions = !isDescriptorProto && !uriStr.endsWith("interop/Options.proto")

				val root = r.contents.get(0) as Proto
				val firstDefinition = root.elements.findFirst[x|x instanceof NamedElement]
				var addIndex = root.elements.length;
				if (firstDefinition !== null) {
					addIndex = root.elements.indexOf(firstDefinition)
				}
				
				if (needAddPlexusOptions) {

					for (service : r.allContents.toIterable().filter(typeof(Service))) {
						val needSetOption = service.body.elements
							.filter(typeof(Option))
							.findFirst [ o | o.name.equals("(.interop.service_id)")] === null
						if (needSetOption) {
							var id = qualifiedNameProvider.getFullyQualifiedName(service).skipFirst(1).toString()
							val option = ProtobufFactory.eINSTANCE.createOption()
							option.name = "(.interop.service_id)"
							option.value = "\"" + id + "\""
							service.body.elements.add(0, option)
						}
					}

					for (message : r.allContents.toIterable().filter(typeof(Message))) {
						val needSetOption = message.body.elements
							.filter(typeof(Option))
							.findFirst [o | o.name.equals("(.interop.message_id)")] === null
						if (needSetOption) {
							var id = qualifiedNameProvider.getFullyQualifiedName(message).skipFirst(1).toString()
							val option = ProtobufFactory.eINSTANCE.createOption()
							option.name = "(.interop.message_id)"
							option.value = "\"" + id + "\""
							message.body.elements.add(0, option)
						}
					}

					val needAddImport = r.allContents
						.filter(typeof(Import))
						.findFirst(x|x.importURI.endsWith("interop/Options.proto")) === null						
					if (needAddImport) {
						val importElement = ProtobufFactory.eINSTANCE.createImport
						importElement.importURI = "interop/Options.proto"
						root.elements.add(addIndex, importElement)
						addIndex++
					}
				}

				if (needAddCustomOptions) {
					for (o : this.customOptions) {
						var customOption = root.elements
							.filter(typeof(Option))
							.findFirst [existingOption | existingOption.name.equals(o.name)]
						if (customOption === null) {							
							customOption = ProtobufFactory.eINSTANCE.createOption()
							customOption.name = o.name
							customOption.value = "\"" + o.value + "\""
							root.elements.add(addIndex, customOption)
							addIndex++
						} else {
							customOption.value = "\"" + o.value + "\""
						}
					}
				}

				var uri = r.URI				
				if (uri.toString().startsWith(baseDirUri.toString())) {
					uri = uri.deresolve(baseDirUri)					
				} else if (uri.toString().startsWith(interopResourceBaseUri.toString())) {
					uri = uri.deresolve(interopResourceBaseUri)					
				} else {
					uri = uri.deresolve(protoResourceBaseUri)
				}
				val deresolvedStr = uri.toString()
				if (deresolvedStr.startsWith("/")) {
					uri = URI.createURI(deresolvedStr.substring(1))						
				}									
				uri = uri.resolve(outDirUri)

				logger.info("Saving " + uri)
				var FileOutputStream fop
				try {
					val file = new File(uri.toFileString())
										
					if (file.exists()) {
						file.delete()
					}
					file.parentFile.mkdirs()
					file.createNewFile()
					fop = new FileOutputStream(file);
					r.save(fop, Collections.EMPTY_MAP)
					fop.flush()
				} finally {
					if (fop !== null) {
						fop.close();
					}
				}
			}
		}
	}
}
