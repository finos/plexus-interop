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
package com.db.plexus.interop.dsl.protobuf

import com.google.inject.Inject
import com.google.inject.Singleton
import java.util.Collections
import org.eclipse.emf.common.util.URI
import org.eclipse.emf.ecore.resource.ResourceSet
import org.eclipse.xtext.resource.IResourceDescriptionsProvider
import java.util.ArrayList

@Singleton
class ProtoLangImportResolver {

	@Inject
	ProtoLangConfig config
	
	@Inject
	protected IResourceDescriptionsProvider resourceDescriptionsProvider
	
	def public resolveURI(ResourceSet resourceSet, String importString) {
		if (importString === null) {
			return null;
		}
		for (resolvedUri: getResolveCandidates(importString)) {
			if (isValidURI(resourceSet, resolvedUri)) {
				return resolvedUri				
			}
		}
	}
	
	def public resolveResource(ResourceSet resourceSet, String importString) {
		val uri = resolveURI(resourceSet, importString)
		if (uri === null) {
			return null
		}
		return resourceSet.getResource(uri, true)
	}
	
	def public resolveResourceDescription(ResourceSet resourceSet, String importString) {
		val resource = resolveResource(resourceSet, importString)
		if (resource === null) {
			return null
		}
		return resourceDescriptionsProvider
			.getResourceDescriptions(resourceSet)
			.getResourceDescription(resource.URI) 		
	}
	
	def public getResolveCandidates(String importString) {
		val result = new ArrayList<URI>()
		val URI uri = URI.createURI(importString)
		for (root : config.baseURIs) {
			try {
				val resolvedUri = uri.resolve(root)
				result.add(resolvedUri)
			} catch (Exception e) {
			}
		}
		try {
			val resolvedUri = URI.createURI(ClassLoader.getSystemClassLoader().getResource(importString).toURI().toString())			
			if (!result.contains(resolvedUri)) {
				result.add(resolvedUri)
			}
		} catch (Exception e) {
		}
		return result
	}
	
	def private static isValidURI(ResourceSet resourceSet, URI uri) {
		if (uri === null || uri.isEmpty()) {
			return false;
		}
		try {
			if (resourceSet.getResource(uri, false) !== null) {
				return true;
			}
			val uriConverter = resourceSet.getURIConverter();
			val normalized = uriConverter.normalize(uri);
			if (normalized !== null) {
				if("platform".equals(normalized.scheme()) && !normalized.isPlatform()) { 
					return false;
				}
				return uriConverter.exists(normalized, Collections.emptyMap());				
			}
		} catch (RuntimeException e) { // thrown by org.eclipse.emf.ecore.resource.ResourceSet#getResource(URI, boolean)			
		}
		return false;
	}
}
