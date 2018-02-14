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

import com.db.plexus.interop.dsl.gen.BaseGenTask
import com.db.plexus.interop.dsl.gen.PlexusGenConfig
import com.db.plexus.interop.dsl.gen.util.FileUtils
import com.google.inject.Inject
import java.io.File
import java.io.IOException
import org.eclipse.xtext.naming.IQualifiedNameProvider
import org.eclipse.xtext.resource.XtextResource
import org.eclipse.xtext.resource.XtextResourceSet

import static extension com.db.plexus.interop.dsl.gen.InteropLangUtils.*

class CsharpGenTask extends BaseGenTask {

	@Inject
	IQualifiedNameProvider qualifiedNameProvider

	override protected doGenWithResources(PlexusGenConfig config, XtextResourceSet resourceSet) throws IOException {

		logger.info(String.format("Generating C# code for %s from %s to %s", config.input, baseDirUri.toFileString, outDirUri.toFileString))
		
		var generator = new CsharpCodeGenerator(config, qualifiedNameProvider)

		val resources = resourceSet.resources

		for (resource : resources) {
			if (resource.services.length > 0 || resource.applications.length > 0) {
				var newUri = resource.URI.resolve(workingDirUri);
				if (newUri.toString().startsWith(baseDirUri.toString())) {
					newUri = newUri.deresolve(baseDirUri).resolve(outDirUri)
				} else {
					newUri = newUri.deresolve(resourceBaseUri).resolve(outDirUri)
				}
				var path = newUri.toFileString
				val file = new File(path + ".g.cs");
				logger.info("Generating " + file.path);
				FileUtils.writeStringToFile(file, generator.gen(resource as XtextResource))
			}
		}
	}
}
