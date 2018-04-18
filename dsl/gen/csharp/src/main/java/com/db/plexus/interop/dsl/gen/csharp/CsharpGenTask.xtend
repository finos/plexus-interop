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

import com.db.plexus.interop.dsl.gen.BaseGenTask
import com.db.plexus.interop.dsl.gen.PlexusGenConfig
import com.db.plexus.interop.dsl.gen.util.FileUtils
import com.google.inject.Inject
import java.io.File
import java.io.IOException
import java.nio.file.Paths
import java.util.LinkedList
import org.eclipse.xtext.naming.IQualifiedNameProvider
import org.eclipse.xtext.resource.XtextResource
import org.eclipse.xtext.resource.XtextResourceSet

import static extension com.db.plexus.interop.dsl.gen.GenUtils.*
import com.google.inject.Injector
import com.db.plexus.interop.dsl.protobuf.ProtoLangUtils
import com.db.plexus.interop.dsl.InteropLangUtils

class CsharpGenTask extends BaseGenTask {

	@Inject
	IQualifiedNameProvider qualifiedNameProvider
	
	@Inject
	Injector injector
					
	override protected doGenWithResources(PlexusGenConfig config, XtextResourceSet resourceSet) throws IOException {
		
		var accessModifier = "public"
		var internalAccessArg = ""		
		if (config.namespace !== null && config.namespace.startsWith("internal_access:")) {
			config.namespace = config.namespace.substring("internal_access:".length)
			accessModifier = "internal"	
			internalAccessArg = "internal_access:"			
		}
		
		var generator = new CsharpCodeGenerator(config, qualifiedNameProvider, baseDirUri, accessModifier)
		injector.injectMembers(generator)

		val resources = resourceSet.resources;

		for (resource : resources) {
			if (!resource.URI.toString.endsWith(ProtoLangUtils.DESCRIPTOR_RESOURCE_PATH) 
				&& !resource.URI.toString.endsWith(InteropLangUtils.DESCRIPTOR_RESOURCE_PATH))
			{
				var newUri = resource.URI.resolve(workingDirUri)
				var path = newUri.toFileString
				if (newUri.toString().startsWith(baseDirUri.toString())) {
					newUri = newUri.deresolve(baseDirUri).resolve(outDirUri)
				} else {
					newUri = newUri.deresolve(resourceBaseUri).resolve(outDirUri)
				}			
				if (newUri.toString.endsWith(".proto")) {
					val newPath = newUri.toFileString				
					val file = new File(newPath)
					file.parentFile.mkdirs
					val args = new LinkedList<String>()
					args.add(config.protocPath)
					args.add("--proto_path=" + baseDirUri.toFileString)
					val resourceBasePath = resourceBaseUri.toFileString
					if (resourceBasePath !== null) { 				
						args.add("--proto_path=" + resourceBaseUri.toFileString)				
					}
					args.add("--csharp_out=" + internalAccessArg + Paths.get(newPath).parent)
					args.add("--csharp_opt=file_extension=.msg.g.cs")
					args.add(path)
					val procBuilder = new ProcessBuilder(args)
					procBuilder.inheritIO()
					logger.info("Launching " + String.join(" ", procBuilder.command))
					var Process proc = null
					try {
						proc = procBuilder.start()
					} catch (Exception e) {
						throw new IOException("Cannot start Protobuf compiler: " + config.protocPath +
							". Probably the path is wrong. You can change it using command-line argument --protoc=<path>.",
							e)
					}
					var exitCode = proc.waitFor
					if (exitCode != 0) {
						throw new IOException("protoc process exited with non-zero exit code: " + exitCode)
					}
					logger.info("Completed " + String.join(" ", procBuilder.command))
				}
				val fileNameSegments = newUri.lastSegment.split("_").map[x | x.toFirstUpper]
				newUri = newUri.trimSegments(1).appendSegment(String.join("", fileNameSegments))				
				if (resource.services.length > 0) {
					val newPath = newUri.toFileString.replace(".proto", ".svc.g.cs");				
					logger.info("Generating " + newPath);
					FileUtils.writeStringToFile(new File(newPath), generator.gen(resource as XtextResource))
				}
				if (resource.applications.length > 0) {				
					val newPath = newUri.toFileString.replace(".interop", ".app.g.cs");				
					logger.info("Generating " + newPath);
					FileUtils.writeStringToFile(new File(newPath), generator.gen(resource as XtextResource))
				}
			}
		}
	}
}
