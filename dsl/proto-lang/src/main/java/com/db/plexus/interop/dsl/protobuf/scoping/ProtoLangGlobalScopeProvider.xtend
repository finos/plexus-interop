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
import org.eclipse.xtext.EcoreUtil2
import com.db.plexus.interop.dsl.protobuf.Import
import com.db.plexus.interop.dsl.protobuf.ImportModifier
import com.google.inject.Inject
import com.db.plexus.interop.dsl.protobuf.ProtoLangConfig
import java.util.List

class ProtoLangGlobalScopeProvider extends ImportUriGlobalScopeProvider {

	@Inject
	ProtoLangConfig config
	
	override IAcceptor<String> createURICollector(Resource resource, Set<URI> collectInto) {
		new ImportCollector(resource, collectInto, config.baseURIs)
	}

	static class ImportCollector implements IAcceptor<String> {

		Resource resource
		Set<URI> result
		List<URI> roots

		new(Resource resource, Set<URI> result, List<URI> roots) {
			this.resource = resource
			this.result = result
			this.roots = roots
		}

		def void addTransitiveImports(URI uri) {
			if (result.contains(uri)) {
				return;
			}
			result.add(uri)
			val resource = this.resource.resourceSet.getResource(uri, true)
			if (resource.contents.length == 0) {
				return;
			}
			for (import : resource.contents.get(0).eContents.filter(typeof(Import))) {
				if (import.modifier == ImportModifier.PUBLIC) {
					new ImportCollector(resource, result, roots).accept(import.importURI)
				}
			}
		}

		override accept(String importString) {
			if (importString === null) {
				return;
			}
			var URI uri;
			try {
				uri = URI.createURI(importString)
				if (EcoreUtil2.isValidUri(resource, uri)) {
					addTransitiveImports(uri.resolve(resource.URI))
					return;
				}
			} catch (Exception e) {
			}
			for (root : roots) {
				try {
					val resolvedUri = uri.resolve(root)
					if (EcoreUtil2.isValidUri(resource, resolvedUri)) {
						addTransitiveImports(resolvedUri)
						return;
					}
				} catch (Exception e) {
				}
			}
			try {
				uri = URI.createURI(ClassLoader.getSystemClassLoader().getResource(importString).toURI().toString())
				if (EcoreUtil2.isValidUri(resource, uri)) {
					addTransitiveImports(uri)
					return;
				}
			} catch (Exception e) {
			}
		}
	}
}
