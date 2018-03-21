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
package com.db.plexus.interop.dsl.protobuf.scoping

import org.eclipse.xtext.scoping.impl.ImportUriGlobalScopeProvider
import org.eclipse.emf.ecore.resource.Resource
import java.util.Set
import org.eclipse.xtext.util.IAcceptor
import org.eclipse.emf.common.util.URI
import com.db.plexus.interop.dsl.protobuf.Import
import com.db.plexus.interop.dsl.protobuf.ImportModifier
import com.google.inject.Inject
import com.db.plexus.interop.dsl.protobuf.ProtoLangImportResolver

class ProtoLangGlobalScopeProvider extends ImportUriGlobalScopeProvider {

	@Inject
	ProtoLangImportResolver importResolver
		
	override IAcceptor<String> createURICollector(Resource resource, Set<URI> collectInto) {
		new ImportCollector(resource, collectInto, importResolver)
	}
	
	static class ImportCollector implements IAcceptor<String> {

		Resource resource
		Set<URI> result
		ProtoLangImportResolver importResolver

		new(Resource resource, Set<URI> result, ProtoLangImportResolver importResolver) {
			this.resource = resource
			this.result = result
			this.importResolver = importResolver
		}

		def void addTransitiveImports(URI uri) {
			if (result.contains(uri)) {
				return;
			}
			result.add(uri)
			val resource = resource.resourceSet.getResource(uri, true)
			if (resource.contents.length == 0) {
				return;
			}
			for (import : resource.contents.get(0).eContents.filter(typeof(Import))) {
				if (import.modifier == ImportModifier.PUBLIC) {
					new ImportCollector(resource, result, importResolver).accept(import.importURI)
				}
			}
		}

		override accept(String importString) {
			val resolvedUri = importResolver.resolveURI(resource.resourceSet, importString) 
			if (resolvedUri !== null) {
				addTransitiveImports(resolvedUri)				
			}			
		}
	}
}
